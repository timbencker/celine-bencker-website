# Tests

An accessibility and integrity suite for the built site, run with Playwright in
the installed Google Chrome. It never downloads a browser.
[Lighthouse](#lighthouse) scores the same build separately. The
[unit tests](#unit-tests), the [breakpoint guard](#breakpoint-guard) and the
[launch check](#launch-check) need no browser.

## Structure

- `tests/e2e/` — the browser suites; `support/` holds their shared helpers
  (server, routes, page probes, axe, the viewports both suites use), `pages/`
  the page specs.
- `tests/unit/` — unit tests for build-time code.
- `tests/guards/` — source checks that run with `npm run lint`.
- `tests/launch/` — the launch check on the built `dist/`.
- `tests/lighthouse/` — the Lighthouse runner.

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

`site.spec.ts` covers every URL in `dist/sitemap.xml`, plus the 404 page (at a
missing path, expecting status 404 and no hreflang), at 375, 768 and 1280px:
one width per tier, [phone, tablet and desktop](#layout-at-every-width). Test
titles start with the page path.

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

## Layout at every width

`layout.spec.ts` loads every page `site.spec.ts` covers at 360, 390, 768, 900,
1119, 1120, 1280 and 1920px, one test per page and width. The desktop tier and
the two widths around it come from `--breakpoint-desktop` in
`src/styles/tokens.css`, read by `support/viewports.ts`, which also holds the
three widths `site.spec.ts` audits. The widths straddle the three tiers:
phone below 768px, tablet from 768px (still one column, with desktop type and
margins), and desktop from 1120px (the board layouts). `src/styles/tokens.css`
sets the tiers; `src/lib/styles.ts` says which classes belong to which.

- **Overflow** — the page is no wider than the viewport, at the widths
  `site.spec.ts` does not cover.
- **Split words** — no word breaks mid-word. A break is fine only right after a
  hyphen, dash or slash; mail addresses and URLs may break anywhere. On failure
  it names the word and the break, like `Einger|eicht (h2, 44px)`.
- **Navigation** — below 1120px the menu control shows and the desktop
  navigation does not. From 1120px the desktop navigation shows, on one row,
  and the menu control does not.
- **Footer height** — from 1120px the footer is exactly `--footer-h` tall. The
  background's row of dots is anchored to that height.

## Breakpoint guard

`tests/guards/breakpoints.ts` runs with `npm run lint` and fails on Tailwind's
default breakpoint names (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`, their `max-`
forms, and arbitrary `min-[…]:` / `max-[…]:`). `tokens.css` switches the
default names off, so such a class generates no CSS and the rule is silently
lost. Use `tablet:` or `desktop:`. Container-query variants (`@xl:`) are
allowed.

## Unit tests

```bash
npm run test:unit
```

Runs `tests/unit/*.test.ts` with `node --test`, without a build or a browser:
the strict data loader (a broken data file stops the build), the page-body
check (text in a page body that its view never renders stops the build), and
the deployment target (`SITE` and `BASE_PATH`).

## Launch check

```bash
npm run build && npm run check:launch
```

Scans the existing `dist/` for placeholder text (`PLATZHALTER`, `PLACEHOLDER`)
and launch blockers: elements marked `data-launch-blocker`, such as the note
that the legal text has not been reviewed yet. It prints when `dist/` was
written, what is left per file, and each blocker's own text, and fails until
nothing is left. The manual deploy workflow
(`.github/workflows/deploy.yml`) runs it before publishing.

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

## Lighthouse

```bash
npm run lighthouse                                  # every page, three runs each
LHCI_RUNS=1 npm run lighthouse                      # one run each, for a quick look
LHCI_RUNS=1 LHCI_ONLY=forschung npm run lighthouse  # pages whose path contains the text
```

PowerShell: `$env:LHCI_RUNS=1; npm run lighthouse`. In Git Bash, give
`LHCI_ONLY` without a leading slash; the shell rewrites values that look like
paths.

Lighthouse CI audits every URL in `dist/sitemap.xml` plus `404.html`, and
fails when a page scores below **95** in performance, accessibility, best
practices or SEO, the target in the brief. Performance is judged on the median
run; the other categories hardly change between runs and use Lighthouse CI's
default, the best run. The 404 page skips
SEO, because it is `noindex` on purpose. The individual audits come from the
`lighthouse:no-pwa` preset, as on
[tanh-lab/website](https://github.com/tanh-lab/website); each one that is
changed says why in `tests/lighthouse/run.ts`.

Reports: `.lighthouse/reports/` (one HTML and one JSON file per run, and
`manifest.json`). The `lighthouse` job in `.github/workflows/ci.yml` runs on
pushes to `main` and on pull requests, and uploads them as the
`lighthouse-reports` artifact, whether the job passes or fails.

**How it runs**, and why it differs from tanh-lab's setup:

- **Base path.** Astro's preview server serves the build under
  `/celine-bencker-website/`, as GitHub Pages does. Lighthouse CI's own static
  server would serve `dist/` at the root, where every asset link breaks.
- **Browser.** The script starts the installed Google Chrome (or
  `CHROME_PATH`) with a debugging port and Lighthouse's usual flags, and
  Lighthouse attaches to it. When Lighthouse launches Chrome itself, deleting
  the temporary profile fails on Windows after every audit. Playwright does not
  start this Chrome: under Playwright, Chrome's own `chrome://` pages show up
  in the audited page's requests.
- **Not a dependency.** `@lhci/cli` runs through a pinned `npx`: installed, it
  brings ten known advisories in old transitive dependencies. Nothing of it
  ships.
- **No public upload.** Reports stay on disk and in the CI artifact.
  Lighthouse CI's temporary public storage would publish the draft pages.

Performance scores follow the machine's load: the same page scored 93 on a
busy laptop and 99 on a quiet one. A local performance failure is worth a
second run before it is worth a fix.
