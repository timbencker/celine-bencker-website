# Tests

An accessibility and integrity suite for the built site, run with Playwright in
the installed Google Chrome. It never downloads a browser.

## Running

```bash
npm run test:e2e                                  # everything, port 4330
E2E_PORT=4333 npm run test:e2e                    # on another port (one per agent)
npm run test:e2e -- --grep "/de/forschung/"       # one page
npm run test:e2e -- --grep "axe"                  # one check, every page
npx playwright show-report                        # the HTML report of the last run
```

PowerShell: `$env:E2E_PORT=4333; npm run test:e2e`. In Git Bash, arguments
that look like paths are rewritten by the shell; `npm run test:e2e` turns them
back, so the `--grep` line above works there too.

Every run builds once, then serves `dist/`. Results: the list in the terminal,
`playwright-report/`, and `test-results/e2e-results.json`.

**Requires** Google Chrome (`channel: 'chrome'`). On GitHub's `ubuntu-latest`
runners it is preinstalled; the `e2e` job in `.github/workflows/ci.yml` runs the
suite and uploads the report when it fails.

## How the server works

- `webServer` runs `npm run build`, then `tests/e2e/support/serve.ts`: Astro's
  static preview server, started through its API. The `astro preview` CLI is
  not used because it detaches into the background when it detects an AI
  agent.
- **Port isolation.** The server takes `E2E_PORT` and nothing else: a taken port
  is an error, never a silent move to the next one. `reuseExistingServer` is
  off.
- **Freshness.** The serve script writes `dist/_e2e/<run id>.txt`, and Playwright
  waits for exactly that URL, so a server from another run, checkout or port
  cannot stand in. The stamp is removed after the run.
- **One request per link target.** `support/global-setup.ts` visits every
  sitemap page and every internal link target once and writes
  `test-results/site-index.json`; the link and hreflang checks read from it.

## What the checks guarantee

`site.spec.ts` covers every URL in `dist/sitemap.xml`, at 375, 768 and 1280px.
Test titles start with the page path.

- **Document** — HTTP 200; `html[lang]` matches the locale in the path; exactly
  one `h1`; one page `header`, `main` and `footer` landmark; a declared icon
  (`<link rel="icon">`), because without one browsers ask for `/favicon.ico`
  at the host root, outside the base path.
- **Skip link** — the first Tab stop is `a.skip-link` pointing at `#main`, it is
  visible while focused, and Enter moves focus to `main#main`.
- **Overflow** — the page is no wider than the viewport. On failure it names the
  widest elements.
- **Errors** — no `console.error` and no uncaught exception while the page loads.
  Chrome's own `/favicon.ico` probe is ignored here; the icon check covers it.
- **Axe** — zero violations for `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`,
  `wcag22aa`. On failure it prints rule id, impact, selectors and an HTML
  snippet, and attaches the full result. What axe cannot decide is not a pass:
  it appears as an `axe-incomplete` annotation in the report. Today that is
  text contrast over the decorative background, which axe cannot compute.
- **Links** — every same-site `<a>`, `<area>` and `<link>` answers 200 and maps to
  a file in `dist/` with exactly that spelling (GitHub Pages is case-sensitive),
  stays under the base path, and every `#fragment` exists as an `id` on its
  target. `href=""` and `href="#"` fail. External links are not requested.
- **New tabs** — every `target="_blank"` link has `rel` containing `noopener`.
- **hreflang** — values are unique and absolute; the page references itself;
  `x-default` is the German version; the head matches the sitemap; every other
  language version declares its language and links back with the same
  `x-default`.

`i18n.spec.ts` encodes [the language policy](../docs/i18n-policy.md):

- **Root redirect** — the bare base URL lands on `/de/` in a fresh browser, also
  with an English browser language. After choosing EN with the switcher, the
  bare root lands on `/en/`, and an explicit `/de/` URL still opens in German.
- **Language control** — on every page, each switcher's other-language control
  either links to the counterpart from the sitemap (whose control links back),
  or is `aria-disabled="true"` when there is none. Clicking it lands on the
  counterpart.
- **Missing pages** — missing paths answer 404 with the bytes of
  `dist/404.html`, which carries `noindex`, one `h1`, and loads without errors
  at any depth. That is what GitHub Pages does for every missing path in the
  project.

## Local preview and GitHub Pages

The suite asserts production behaviour where the two differ:

- **Trailing slashes** — GitHub Pages redirects `/de/forschung` to
  `/de/forschung/`; the preview serves both directly. Both end in 200, so links
  pass either way.
- **Letter case** — the preview on Windows serves `/DE/Forschung/`; GitHub
  Pages does not. The link check compares against `dist/` exactly.
- **Outside the base path** — the preview answers with its own 404 notice; on
  GitHub Pages those URLs belong to `timbencker.github.io`, not to this site.
  Nothing here tests them.

## Page specs

Page-specific acceptance specs go in `tests/e2e/pages/<page>.spec.ts`. Import
routes and helpers from `tests/e2e/support/`, and start test titles with the
page path so `--grep` keeps selecting one page.
