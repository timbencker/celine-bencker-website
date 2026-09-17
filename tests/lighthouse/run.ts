/**
 * `npm run lighthouse`: audits the production build with Lighthouse CI.
 *
 * Modelled on tanh-lab/website, which runs Lighthouse CI against its static
 * build. The differences, each for a reason:
 *
 * - The build is served by Astro's own preview server, which serves it under
 *   its base path (`/celine-bencker-website/`) as GitHub Pages does. Lighthouse
 *   CI's built-in static server would serve `dist/` at the root, where every
 *   stylesheet and font the HTML links would 404.
 * - This script starts the installed Google Chrome (as the e2e suite uses) and
 *   Lighthouse attaches to it through a debugging port. When Lighthouse
 *   launches Chrome itself, its launcher fails on Windows while deleting
 *   Chrome's temporary profile after every audit, and Lighthouse CI's own
 *   workaround no longer recognises that error. Chrome is not started through
 *   Playwright: in a browser Playwright controls, Chrome's own interface pages
 *   (`chrome://…`) turn up in the audited page's network requests.
 * - Lighthouse CI runs through a pinned `npx` rather than being installed:
 *   `@lhci/cli` 0.15.1 brings ten known advisories in old transitive
 *   dependencies, and this is a public repository under Celine's name. The
 *   tool only runs here and in CI; nothing of it ships.
 * - Reports stay on the filesystem (`.lighthouse/reports/`, a CI artifact)
 *   instead of temporary public storage, which would publish the draft pages.
 *
 * The URL list comes from the built sitemap, so a new page is audited without
 * touching this file.
 *
 *   LHCI_RUNS=1          runs per URL (default 3; performance uses the median run)
 *   LHCI_ONLY=forschung  only URLs containing that text
 */
import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { preview } from 'astro';

const LHCI = '@lhci/cli@0.15.1';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const WORK = `${ROOT}.lighthouse/`;

/** Same env vars and defaults as astro.config.mjs. */
const base =
  `/${(process.env.BASE_PATH ?? '/celine-bencker-website').replace(/^\/+|\/+$/g, '')}/`.replace(
    /^\/\/$/,
    '/',
  );
const productionBase = new URL(base, process.env.SITE ?? 'https://timbencker.github.io').href;

const runs = Number(process.env.LHCI_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1) {
  throw new Error(`LHCI_RUNS must be a positive integer, got "${process.env.LHCI_RUNS}".`);
}

// --- The pages to audit ---------------------------------------------------------

let sitemap: string;
try {
  sitemap = readFileSync(`${ROOT}dist/sitemap.xml`, 'utf8');
} catch {
  throw new Error('dist/sitemap.xml is missing. Build first: `npm run lighthouse` does that.');
}

const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => {
  const url = loc!.trim().replaceAll('&amp;', '&');
  if (!url.startsWith(productionBase)) {
    throw new Error(`Sitemap URL ${url} is not under ${productionBase}.`);
  }
  return url.slice(productionBase.length);
});
if (paths.length === 0) throw new Error('dist/sitemap.xml lists no pages.');

// GitHub Pages serves 404.html for every missing path. Lighthouse cannot audit
// a document answered with 404, so the page is requested by name.
paths.push('404.html');

const only = process.env.LHCI_ONLY;
const selected = paths.filter((path) => !only || path.includes(only));
if (selected.length === 0) throw new Error(`LHCI_ONLY="${only}" matches no page.`);

// --- Assertions -----------------------------------------------------------------

/**
 * The brief asks for Lighthouse >= 95; that is the gate for every category.
 * Individual audits come from the `lighthouse:no-pwa` preset, as on tanh-lab.
 * Every audit changed below says why.
 */
const categories = {
  'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
  'categories:accessibility': ['error', { minScore: 0.95 }],
  'categories:best-practices': ['error', { minScore: 0.95 }],
  'categories:seo': ['error', { minScore: 0.95 }],
};

const audits = {
  // Reported intermittently, on different pages from run to run, and always
  // "[unattributed]": no page script is involved. The site's only script (the
  // language choice in BaseLayout) reads no layout, and traced page loads
  // show no layout inside it. Whatever the reflow costs is already counted in
  // Total Blocking Time, which the performance score gates.
  'forced-reflow-insight': 'warn',
};

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- Run ----------------------------------------------------------------------------

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() =>
        typeof address === 'object' && address
          ? resolve(address.port)
          : reject(new Error('no port')),
      );
    });
  });
}

/** Where Playwright's `channel: 'chrome'` finds Google Chrome, or CHROME_PATH. */
function findChrome(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const windows = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
  ];
  const candidates: Partial<Record<NodeJS.Platform, string[]>> = {
    win32: windows.filter(Boolean).map((dir) => `${dir}\\Google\\Chrome\\Application\\chrome.exe`),
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    linux: ['/opt/google/chrome/chrome'],
  };
  const found = candidates[process.platform]?.find((path) => existsSync(path));
  if (!found) throw new Error('Google Chrome not found. Install it, or set CHROME_PATH.');
  return found;
}

/** Starts Chrome for Lighthouse to attach to; resolves with its debugging port. */
async function startChrome(profile: string): Promise<{ chrome: ChildProcess; port: number }> {
  const chrome = spawn(
    findChrome(),
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      // The defaults Lighthouse's own launcher sets (chrome-launcher's
      // DEFAULT_FLAGS): nothing in the background competes with the audit.
      '--disable-features=TranslateUI',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--disable-sync',
      '--metrics-recording-only',
      '--disable-default-apps',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
      '--force-fieldtrials=*BackgroundTracing/default/',
      // In Linux CI, without Chrome's sandbox, as the e2e suite runs it
      // (Playwright's `chromiumSandbox` is off by default).
      ...(process.platform === 'linux' && process.env.CI ? ['--no-sandbox'] : []),
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  let exited = false;
  chrome.on('exit', () => (exited = true));

  // With port 0, Chrome picks a free port and writes it to this file.
  const portFile = `${profile}/DevToolsActivePort`;
  for (let waited = 0; waited < 30_000; waited += 100) {
    if (exited) throw new Error('Chrome exited during start-up.');
    if (existsSync(portFile)) {
      const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
      if (port > 0) return { chrome, port };
    }
    await sleep(100);
  }
  chrome.kill();
  throw new Error('Chrome did not open a debugging port within 30 s.');
}

/**
 * Closes Chrome through its debugging protocol, so every Chrome process ends
 * and releases the profile. Killing the main process alone leaves helpers
 * holding files on Windows.
 */
async function stopChrome(chrome: ChildProcess, port: number): Promise<void> {
  if (chrome.exitCode !== null) return;
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  try {
    const { webSocketDebuggerUrl } = (await (
      await fetch(`http://127.0.0.1:${port}/json/version`)
    ).json()) as { webSocketDebuggerUrl: string };
    const socket = new WebSocket(webSocketDebuggerUrl);
    socket.addEventListener('open', () =>
      socket.send(JSON.stringify({ id: 1, method: 'Browser.close' })),
    );
    await Promise.race([exited, sleep(10_000)]);
  } finally {
    if (chrome.exitCode === null) chrome.kill();
    await exited;
  }
}

// Retries: on Windows, files of the previous run's Chrome can stay locked for a moment.
rmSync(WORK, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
mkdirSync(WORK, { recursive: true });

const sitePort = await freePort();
const server = await preview({
  root: ROOT,
  logLevel: 'warn',
  server: { port: sitePort, host: '127.0.0.1' },
  vite: { preview: { strictPort: true } },
});

const { chrome, port: chromePort } = await startChrome(`${WORK}chrome-profile`);

let exitCode = 1;
try {
  const urls = selected.map((path) => `http://127.0.0.1:${sitePort}${base}${path}`);
  const config = {
    ci: {
      collect: {
        url: urls,
        numberOfRuns: runs,
        // Attach to the browser above instead of launching one.
        settings: { port: chromePort },
      },
      assert: {
        assertMatrix: [
          {
            matchingUrlPattern: `^(?!.*${escape('/404.html')}$).*$`,
            preset: 'lighthouse:no-pwa',
            assertions: { ...categories, ...audits },
          },
          {
            // The 404 page is `noindex` on purpose, which the SEO category
            // scores as a failure. Everything else applies.
            matchingUrlPattern: `${escape('/404.html')}$`,
            preset: 'lighthouse:no-pwa',
            assertions: {
              ...categories,
              ...audits,
              'categories:seo': 'off',
              'is-crawlable': 'off',
            },
          },
        ],
      },
      upload: {
        target: 'filesystem',
        outputDir: `${WORK}reports`,
      },
    },
  };

  const configPath = `${WORK}lighthouserc.json`;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Lighthouse CI: ${urls.length} URLs × ${runs} run(s), base ${base}`);

  // npx is a .cmd on Windows, which Node only starts through a shell; one
  // command string keeps that portable. Async, so this process keeps serving
  // the site and the browser while Lighthouse works.
  exitCode = await new Promise<number>((resolve) => {
    spawn(`npx --yes ${LHCI} autorun --config="${configPath}"`, {
      cwd: ROOT,
      shell: true,
      stdio: 'inherit',
    }).on('exit', (code) => resolve(code ?? 1));
  });
} finally {
  await stopChrome(chrome, chromePort);
  await server.stop();
}

process.exit(exitCode);
