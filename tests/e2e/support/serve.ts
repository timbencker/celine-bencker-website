/**
 * The E2E web server: the fresh production build, served by Astro's own static
 * preview server. Started by `webServer` in playwright.config.ts, after
 * `npm run build`, and run directly by Node (type stripping, so it imports no
 * local .ts files).
 *
 * Why not the `astro preview` CLI: when it detects an AI agent environment,
 * Astro 7 detaches the preview server into the background and exits at once,
 * and it keeps a per-project lock file. Playwright would treat the exit as a
 * failed start, and the server would outlive the run. The programmatic API is
 * the same preview server without either behaviour.
 *
 * Two guarantees, so a run can never test someone else's server:
 * - Strict port. If E2E_PORT is taken on either localhost address, this exits
 *   with an error instead of moving to the next free port.
 * - Freshness. It writes `dist/_e2e/<run id>.txt`, and Playwright waits for
 *   exactly that URL. No other server, and no earlier build, can answer it.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { fileURLToPath } from 'node:url';

import { preview } from 'astro';

const port = Number(process.env.E2E_PORT);
const runId = process.env.E2E_RUN_ID ?? '';

if (!Number.isInteger(port) || port < 1 || port > 65535 || !/^[\w-]+$/.test(runId)) {
  console.error('serve.ts needs E2E_PORT and E2E_RUN_ID; start it through `npm run test:e2e`.');
  process.exit(1);
}

function isListening(host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ port, host });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

const hosts = ['127.0.0.1', '::1'];
const busy = await Promise.all(hosts.map(isListening));
const taken = hosts.filter((_, i) => busy[i]);
if (taken.length > 0) {
  console.error(
    `Port ${port} is already in use on ${taken.join(' and ')}. ` +
      'Stop that server, or run the suite on another port with E2E_PORT=<port>.',
  );
  process.exit(1);
}

const root = new URL('../../../', import.meta.url);
const stampDir = new URL('dist/_e2e/', root);
rmSync(stampDir, { recursive: true, force: true });
mkdirSync(stampDir, { recursive: true });
writeFileSync(new URL(`${runId}.txt`, stampDir), `${runId}\n`);

await preview({
  root: fileURLToPath(root),
  logLevel: 'warn',
  server: { port },
  vite: { preview: { strictPort: true } },
});
