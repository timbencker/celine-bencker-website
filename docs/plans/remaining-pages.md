# Remaining pages — work specification

Status: **active** · Manager: the coordinating session · Started 2026-09-16

Everything after Home, split into work units that agents build in parallel,
each in its own git worktree, and the manager reviews and merges.

## Waves and ownership

| Wave | Unit                      | Branch / worktree     | E2E port | Depends on    |
| ---- | ------------------------- | --------------------- | -------- | ------------- |
| 1    | **A** Shared components   | `wip/w1-components`   | 4331     | —             |
| 1    | **B** Background extras   | `wip/w1-background`   | 4332     | —             |
| 1    | **C** Test infrastructure | `wip/w1-tests`        | 4333     | —             |
| 2    | **R** Research (10b)      | `wip/w2-research`     | 4341     | Wave 1 merged |
| 2    | **P** Publications (7a)   | `wip/w2-publications` | 4342     | Wave 1 merged |
| 2    | **V** CV (7b)             | `wip/w2-cv`           | 4343     | Wave 1 merged |
| 2    | **T** Talks & Media (8c)  | `wip/w2-talks-media`  | 4344     | Wave 1 merged |
| 2    | **K** Contact (9b)        | `wip/w2-contact`      | 4345     | Wave 1 merged |
| 2    | **N** 404 (11a)           | `wip/w2-not-found`    | 4346     | Wave 1 merged |

Worktrees live at `C:/_Dev/celine-bencker-website/.worktrees/<branch-suffix>`.
The manager creates them, merges them, and removes them.

Units in a wave own disjoint files, so they cannot conflict. Wave 2 starts from
`main` after Wave 1 is merged, so page units build on the real components and
the real test suite.

## Rules for every unit

**Where you work**

1. Work only inside your worktree. Use absolute paths. Commit on your branch.
   Never push, never merge, never touch `C:/_Dev/celine-bencker-website` itself
   or another worktree.
2. The design reference is read-only at `C:/_Dev/celine-bencker-website/design/`
   (it is gitignored, so it is not inside your worktree). Do not use the Browser
   pane tools: the pane is shared and does not render on this machine.
3. Edit only the files your unit owns (listed per unit). If you need a change
   anywhere else, do not make it — describe it under **Requests for the
   manager** in your report.
4. Add no dependencies, except unit C.

**How the design is read**

5. Precedence when sources disagree: the rendered **board** wins on what the
   page looks like; a **CVA definition** in `_Komponenten` wins inside its
   component; values neither sets come from the `ui-*` file; the brief's
   accessibility floor (contrast ≥ 4.5:1, keyboard operable, no lost content)
   wins over all. Background: `docs/design-inventory.md` § "When the sources
   disagree". Record every deviation from the board in your report.
6. Colours only through tokens (`src/styles/tokens.css`) — no raw hex, also not
   inside SVG (use `currentColor` or `var(--color-…)`). A colour the board uses
   that has no token is a request for the manager.
7. One breakpoint, `md` (768px). Desktop values come from the 1280px artboard,
   phone values from the "Mobile · 390" artboard beside it in the same board
   file. Content must never be clipped; wrap instead.
8. Zero JavaScript by default. Prefer HTML and CSS (`<details>`, radio inputs
   with `:has()`). Any `<script>` needs a reason in your report. No framework
   islands.

**Content and facts** — this site carries a real person's name.

9. **Facts only from verified sources:** `design/sources/orcid-*.json` and
   `design/sources/crossref-*.json` (Celine's public ORCID record and Crossref
   metadata for her DOIs), the brief, and what is already in `src/content/`.
   The boards contain specific claims that are **wrong** when checked — the CV
   board lists degrees from Salzburg, ORCID lists Vienna. Never copy a date,
   venue, institution, grant, outlet, quote, address, email, URL or statistic
   from a board unless a verified source confirms it.
10. What is not verified becomes a clearly marked placeholder
    (`PLATZHALTER – …` / `PLACEHOLDER – …`) with the board's example kept as a
    YAML comment for Celine.
11. Descriptive prose from a board (explanations, section intros, questions)
    may be used as the German draft. Mark it in YAML:
    `# Entwurf aus dem Design – von Celine zu prüfen`. The English version is
    your translation: `# EN: Übersetzung – von Celine zu prüfen`.
12. No invented links. A link without a known target is omitted, never `#`.
    Downloads (PDF, press kit, photos) render only if the file exists under
    `public/`; show format and size computed at build time
    ("PDF, 180 kB"). Otherwise omit the control and report it.
13. Page copy lives in your page's frontmatter block
    (`src/content/schemas/blocks/<page>.ts`), not in `src/i18n/ui.ts`. Both
    languages, per `docs/i18n-policy.md`.

**Accessibility, every page**

14. One `h1`, headings in order, landmarks via `SiteChrome`/`PageLayout`,
    lists as `<ul role="list">`, external links via `ExternalLink`, mail via
    `MailLink`, primary controls ≥ 44px, visible focus, text contrast ≥ 4.5:1
    (compute any new colour pair and put the ratio in your report).

**Done means**

15. From your worktree, all of these pass, and you paste their summary lines
    into your report:
    `npm run format` → `npm run format:check`, `npm run lint`, `npm run check`,
    `npm run build`, and — in Wave 2 — the suite for your page:
    `E2E_PORT=<your port> npm run test:e2e -- --grep "<route>"` once per
    route of your page, e.g. `--grep "de/forschung/"` and
    `--grep "en/research/"`. That selects both the site checks and your
    page spec. Other pages' specs fail until their units land — that is
    expected and not yours.
16. Commit with a conventional message that explains why. No AI attribution
    of any kind.
17. Report: files changed; decisions; deviations from the board and why;
    placeholders left for Celine; requests for the manager; verification lines.

## Shared interfaces (exist on `main`)

- `src/layouts/SiteChrome.astro` — document + header + footer from plain
  values. `src/layouts/PageLayout.astro` — the same, derived from a content
  entry. Both take a `masthead` slot for the title block.
- `src/views/<Page>View.astro` — one view per page, registered in
  `src/pages/[locale]/[...slug].astro`. Each unit replaces its stub.
- `src/content/schemas/blocks/<page>.ts` — one frontmatter block per page,
  enforced to appear only on its own page.
- `src/content/schemas/<collection>.ts` + `src/content/data/<collection>.yaml`
  — one per collection, already registered in `src/content.config.ts`.
- `resolvePage(to, locale, allPages)` / `pageHref()` / `homeHref()` in
  `src/i18n/pages.ts` — link to pages by translationKey.
- `src/lib/styles.ts` — `container`, `splitGrid`, `arrow`, `EXTERNAL_GLYPH`,
  `heading` (levels `section`, `row`, `lookup`).
- `src/components/primitives/` (from Unit A) — `PageHeader`, `PageTitle`,
  `ListRow` (`default`, `static`, `date`, `publication`, `cv`; `edge`),
  `Tile` (`row`, `card`), `Button` (one per page), `Callout`, `Section`
  (`split`, `label`, `stacked`, `framed`), `MailLink` (`subject`, `label`),
  `Portrait` (ratios, optional image), `TextLink` (with `download` for
  "PDF ↓ (180 kB)" and BibTeX), `ExternalLink`, `Band`. Their props are
  documented in each file; every variant is on the dev-only review page
  `/dev/components/de/` (`npx astro dev --background --port <your port>`).
  `links.ts` decides internal/external/mail from the URL and throws on `#`;
  `format.ts` has `formatFileSize` and `dateParts`.
- Stubs already carry link targets other pages use: the three research line
  ids on Research, `#impressum` on Contact. Keep them when you replace the
  stub.
- The background's hero marks sit in the header gap on Home and Research, and
  a small mark sits 96–114px from the top on phones. Page titles must stay
  inside their column on desktop and start at or below 114px on phones.

---

## Unit A — Shared components (Wave 1)

**Scope.** Build every component that more than one page needs, following its
CVA definition in `design/_Komponenten.dc.html` and the matching `ui-*` values.

**Owns.** `src/components/primitives/**`, `src/lib/styles.ts`, `src/lib/cn.ts`,
`src/i18n/ui.ts` (generic strings only), `src/pages/dev/**`.

**Build.**

- `PageHeader.astro` — the subpage masthead: the `Header 7/5` split, padding
  from the boards, a default slot (title side) and an `aside` slot.
- `PageTitle.astro` — `ui-PageTitle`: h1 (72px desktop, .94, −.05em; phone 48)
  with an optional intro (19px, text-2, 44ch).
- `ListRow.astro` — add kinds `date` (talks), `publication` (publications and
  research methods), `cv`, plus `static` (no link, no arrow) and the `first` /
  `last` edge treatments from `ui-HairlineRow`. Keep `default` unchanged.
- `Tile.astro` — add kind `card` (logo slot or placeholder, title, meta,
  external ↗).
- `Button.astro` — the one pill per page: `lilac` on paper/bone, `ink` on the
  lilac tint; kinds internal (→), external (↗, new tab, spoken warning),
  download (↓ plus "(PDF, 180 kB)").
- `Callout.astro` — the "Kurz gesagt" tint surface with a label and a slot.
- `Section.astro` — add layout `framed` (paper block with hairlines top and
  bottom inside the page margin).
- `MailLink.astro` — add optional `subject` and a visible `label`; keep the
  entity encoding.
- `Portrait.astro` — ratios `4/5`, `16/9`, `1/1`; optional `src`
  (`ImageMetadata`) with required `alt`, rendered through `astro:assets`
  `<Picture>` with AVIF/WebP and `sizes`; placeholder otherwise.
- `styles.ts` `heading` — add the h3 levels `row` (28/1.1, phone 22) and
  `lookup` (22/1.25, phone 18).
- `src/pages/dev/components/[locale].astro` (a locale segment, because the
  site's locale routing answers 404 for page paths without one) — every
  component and variant on one page,
  **built only in dev** (`getStaticPaths` returns nothing in production, or
  equivalent). Used for review.

**Acceptance.**

1. Home renders byte-identically except for intended class changes — Home's
   existing usages keep working without edits to `HomeView.astro`.
2. Every variant appears on `/dev/components` in `npm run dev`; the production
   build emits no `/dev/` route.
3. `Button` renders at most the variants the spec allows; `download` shows
   format and size passed in by the caller.
4. `Portrait` without `src` renders the placeholder; with `src` renders
   `<picture>` with AVIF and WebP sources.
5. All checks in rule 15 pass (no E2E yet in Wave 1).

## Unit B — Background extras (Wave 1)

**Scope.** Finish the `verwoben` port: the pieces the per-page recipes use that
are not built yet — `heroMark` (desktop and `heroMobil`), `messpunkte`,
`kurvenPaar`, and the edge scale `skala(n, marke)` with its `edge` container.
Phone variants follow the canvas's `mobile` branch.

**Source.** `design/seiten-logic.js` (the whole board script; the helpers are in
its first ~110 lines) and `design/verwoben-source.js`.

**Owns.** `src/components/background/**` only.

**Acceptance.**

1. The recipe table in `Background.astro` matches the canvas `rezept` map
   exactly, including `hero` and `items`, for every page key.
2. Everything stays CSS-scaled (`vw` against 1280, the phone set against 390)
   and needs no JavaScript.
3. The three accessibility rules from the source comment hold: fills under
   text stay ≥ 92% lightness; strokes, marks and the scale stay in the page
   margin, never under text; colours via tokens.
4. The layer stays `aria-hidden`, `pointer-events: none`, clipped
   (`overflow: hidden`), and never widens the page.
5. Pages with `background: aus` render no background markup.
6. All checks in rule 15 pass.

## Unit C — Test infrastructure (Wave 1)

**Scope.** An automated accessibility and integrity suite that every later unit
runs.

**Owns.** `package.json`, `package-lock.json`, `playwright.config.ts`,
`tests/**`, `.github/workflows/ci.yml`, and — only as far as the tests need —
`eslint.config.js`, `tsconfig.json`, `.gitignore`, `.prettierignore`.

**Build.**

- Dev dependencies `@playwright/test` and `@axe-core/playwright`. Use the
  installed Google Chrome (`channel: 'chrome'`). **Do not run
  `playwright install` or download browsers.** If Chrome cannot be used, stop
  and report.
- `playwright.config.ts`: `webServer` builds and serves the production output
  with `astro preview` on `process.env.E2E_PORT ?? 4330`; `baseURL` includes
  the `/celine-bencker-website` base.
- `npm run test:e2e`.
- `tests/e2e/site.spec.ts` — for every URL in the built `sitemap.xml`, at 375,
  768 and 1280px wide (the URL in each test title, so `--grep` can select one
  page):
  - HTTP 200; `html[lang]` matches the path's locale; exactly one `h1`;
    `header`, `main`, `footer` present;
  - the skip link is the first focusable element and targets `#main`;
  - no horizontal overflow (`scrollWidth <= clientWidth`);
  - no console errors and no page errors;
  - axe with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`:
    zero violations (print them readably on failure);
  - every internal link resolves, and every `#fragment` exists on its target;
  - every `target="_blank"` link has `rel` containing `noopener`;
  - hreflang alternates are reciprocal and `x-default` points at `/de/`.
- `tests/e2e/i18n.spec.ts` — `/` lands on `/de/`; each language control leads
  to the counterpart page; the 404 page (any missing path) is served with
  `noindex`.
- CI: a job in `.github/workflows/ci.yml` that runs the suite on
  `ubuntu-latest` (Google Chrome is preinstalled there).

**Acceptance.**

1. `E2E_PORT=4333 npm run test:e2e` runs to completion and is deterministic.
2. Failures caused by **site code** are not fixed by you: list each with the
   route, viewport and axe rule in your report. The manager fixes them before
   Wave 2.
3. `--grep "/de/forschung/"` selects only that page's tests.
4. All checks in rule 15 pass.

---

## Wave 2 — page units

Each page unit owns:

- `src/views/<Page>View.astro`
- `src/components/<page>/**` for page-only components
- `src/content/schemas/blocks/<page>.ts`
- `src/content/pages/de/<slug>.md` and `src/content/pages/en/<slug>.md`
- its data collections, listed per unit (schema and YAML)
- `tests/e2e/pages/<page>.spec.ts` is written by the **manager** before the
  unit starts. Make it pass; do not weaken it. If a test is wrong, report it.

### Unit R — Research (board `design/boards/10b-research.html`)

Data: `research` (schema + YAML). Home reads `id`, `order`, `title`,
`teaser` — keep those compatible, and keep the three ids
(`pms-stress`, `stress-im-alltag`, `hormone-gehirn-stimmung`) as the anchor ids
of the three lines on the page.

- The question as page title, and the register toggle "Fachlich | Einfach
  erklärt" in the header, switching the **whole page**. Build it without
  JavaScript: a radio group (native keyboard support, announced state) and
  `:has()`; with no `:has()` support the specialist text shows. Where a line has
  no plain text in the current language, the specialist text shows in both
  registers.
- Line 1, the ISSAC study as the `framed` block, line 3, Methods, Collaboration
  (bone). The two `ui-Term` definitions are page components.
- The study facts (duration, effort, eligibility), the "Teilnehmen" target and
  the study-protocol link: the protocol is verified
  (BMJ Open 2026, DOI `10.1136/bmjopen-2026-123210`); the rest are
  placeholders unless verified.
- Paper links under lines use the verified DOIs.
- The hormone-curve graphic is a page component, decorative, tokens only.
- The question title wraps inside its column (no `nowrap`), keeping the
  header's 7/5 split with a gap of at least 64px — the background's hero
  marks sit in that gap.

### Unit P — Publications (board `design/boards/7a-publications.html`)

Data: `publications` (schema + YAML).

- Entries from `design/sources/`: every journal article, preprint and
  conference contribution in the ORCID works list, with authors, venue, year,
  volume/pages and DOI from Crossref. Where a preprint has a published version,
  list the published one and report the pair. The haematology trial
  (eClinicalMedicine 2023) is a real co-authorship from her study-coordinator
  role — include it, and report it as a question for Celine.
- Year groups; first authorship bold; "Kurz gesagt" only where the board has
  one (the two summaries are design drafts — mark them). The "Eingereicht"
  group is unverified — placeholders.
- Profile links from `site.yaml` only. BibTeX: generate
  `publications.bib` from the YAML at build time and link it with its real
  size.
- No filter UI (the board has none).

### Unit V — CV (board `design/boards/7b-cv.html`)

Data: `cv` (schema + YAML).

- Education, positions and funding **only** from `orcid-educations.json`,
  `orcid-employments.json`, `orcid-fundings.json`. Peer review: the journals
  and counts in `orcid-peer-reviews.json` (resolve journal names from the
  ISSNs via Crossref if possible; otherwise report). Publications section:
  derived from the `publications` collection, not retyped.
- Everything else on the board (doctorate, research stay, teaching, prizes,
  memberships, talks) is a placeholder.
- "Was ich mitbringe": descriptive draft, marked.
- PDF buttons: rule 12.
- Note for the report: the ÖAW position ends 2026-09-30 per ORCID.

### Unit T — Talks & Media (board `design/boards/8c-talks-media.html`)

Data: `talks`, `media` (schemas + YAML).

- Verified talks: the ICBM 2025 conference presentation and the ISSAC
  abstract in ORCID works. Every talk, date, outlet and quote on the board is
  unverified — placeholders. The quote block needs a real, approved quote:
  render the placeholder state.
- Upcoming vs past is derived from the build date.
- Themes as questions (descriptive draft). The "Für Redaktionen" block is the
  site's one lilac-tint section, with the ink button for the press kit
  (rule 12). The press email on the board uses a domain that does not exist
  yet — use `site.yaml`'s email.
- "Alle Talks" / "Alle Beiträge" have no target — omit them (rule 12).

### Unit K — Contact (board `design/boards/9b-contact.html`)

- The address as the large header element (`MailLink`), three tiles for the
  three reasons to write (mail with subject, the Talks page, the Research
  study anchor), institute block, profiles from `site.yaml`, and the
  **Impressum** section with `id="impressum"` (the footer links there).
- Institute name and address are unverified — placeholders (the ORCID
  department is "Department of Clinical and Health Psychology, University of
  Vienna"; the street address is not in any source).
- Impressum and privacy text: legal drafts — mark them for review, and every
  personal datum is a placeholder.

### Unit N — 404 (board `design/boards/11a-not-found.html`)

Owns `src/pages/404.astro` and the `notFound` collection instead of a view.

- GitHub Pages serves one `404.html` for every missing path. German chrome and
  copy, with an English paragraph (`lang="en"`) and a link to the English home.
  No JavaScript.
- The "Weiter zu" list is generated from the navigation, not retyped. The
  "Kaputter Link gefunden?" mail uses `MailLink`.
- `noindex`, the `notfound` background recipe.

---

## Manager checklist

- [x] Wave 0: canvas and sources on disk, shared files split, stubs registered,
      refactor proven output-identical.
- [x] Wave 1 dispatched · reviewed · merged (Tim) · pre-existing E2E failures
      fixed (icon declared, stub anchors) · worktrees removed.
- [x] Page acceptance specs written (red): 42 failing, all on stub pages;
      site and i18n suites green.
- [ ] Wave 2 dispatched · reviewed · merged
- [ ] Full suite green on `main`; browser pass at 375/768/1280; push
