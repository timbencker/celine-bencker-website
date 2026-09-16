# Design inventory

What the Claude Design canvas contains, and how it maps onto this repo.
Source: project `1aed3cf9-e65f-4f5a-b47e-d4235b84d488` ("Celine Bencker Website
Brief"), read 2026-09-09. Reference copies in `design/` (gitignored).

## Who the site is for

Celine Bencker — Klinische & Gesundheitspsychologie, Universität Wien, ÖAW
DOC-Fellow. Research on stress, hormones and premenstrual symptoms.
ORCID `0000-0002-3802-1339`. Target domain `celinebencker.com`.

Four audiences, in the brief's order: Forschende im Feld · Berufungs- und
Auswahlkomitees · Journalist:innen und Redaktionen · later, Klient:innen and
Veranstalter. Tone target is stated numerically: **~70% editorial / 30%
akademisch**.

## Pages — the decided state

The canvas explores many variants per page. The board records exactly one
decision each ("Aktueller Stand"). Only these get built:

| Page          | Variant | Direction                                                                 |
| ------------- | ------- | ------------------------------------------------------------------------- |
| Home          | `6a`    | Reduziert — alles, was nicht trägt, ist weg                               |
| Research      | `10b`   | Frage + Toggle im Hero; Linie 1 Papier · Studie als Hairline              |
| Publications  | `7a`    | Jahresgruppen, Erstautorenschaft fett, „Kurz gesagt" nur bei ausgewählten |
| CV            | `7b`    | PDF-Download oben; „Was ich mitbringe"                                    |
| Talks & Media | `8c`    | Für Redaktionen gebaut: Themen als Fragen, O-Ton + Pressefoto             |
| Kontakt       | `9b`    | Eine Seite, drei Wege: Mail (mit Anliegen), Institut, Profile             |
| 404           | `11a`   | Kein Sackgassen-Layout: Fehlerhinweis klein, Weiterführung                |

**„Aktuelles" / News is rejected.** Variant `9a` is marked _verworfen —
Pflegelast, Inhalte stehen bereits auf den Fachseiten_. The brief (§4) still
lists a News page; the board is newer and wins. Do not build it.

Navigation: Research · Publications · Talks & Media · News~~ · CV, plus a
Kontakt button and the DE/EN switch — minus the rejected News entry.

## Components

Eight are imported by the pages (`<dc-import>`), each its own file:

`ui-SiteNav` · `ui-PageTitle` · `ui-HairlineRow` · `ui-Term` · `ui-NewsRow` ·
`ui-NewsBand` · `ui-ImagePlaceholder` · `ui-SiteFooter`

`_Komponenten` documents eleven with their named variants: **Section,
PageHeader, ListRow, Tile, Button & Link, Chip, RegisterToggle, Callout
„Kurz gesagt", Band, QuoteBlock, Nav & Footer** — plus a mobile section
(< 768), a sticker sheet, and an `Inhalt ↔ Komponente` mapping.

`ui-NewsRow` / `ui-NewsBand` survive the News rejection: they carry the
„Aktuell" teasers on Home.

## „Einfach erklärt" — component-level, not a page variant

The brief is explicit: no switch on Home (already plain), no parallel site.
It appears in exactly two places, as component state:

- **Research** — `RegisterToggle` „Fachlich | Einfach erklärt", **per
  Forschungslinie**. Content fields: `text` and `text_plain`, each DE and EN.
- **Publications** — `Callout „Kurz gesagt"` on selected works only. One
  optional field: `summary_plain`.
- **Talks & Media, CV** — nothing. Already plain or purely factual.

So this is a per-item field pair, not a `(locale, variant)` page axis.

## Backgrounds

The canvas offers ten families: Verwoben · Aus · Shapes · Shapes groß ·
Zyklus · Maximal · Achtziger · Komposition · Flächen · Fläche + Linie.

**Build only `verwoben` and `aus`.** The rest are deferred behind the
`Background` variant seam.

`verwoben` (`mode === 9`) is _"je Seite ein eigenes Rezept aus gemeinsamen
Bausteinen"_ — shared SVG building blocks combined differently per page:

| Baustein       | Size  | Opacity | Placement                                 |
| -------------- | ----- | ------- | ----------------------------------------- |
| `kreisFlaeche` | 920²  | .7      | top −520, right −40                       |
| `kreisLinie`   | 1082² | .08     | top −620, right −110                      |
| `quadratLinks` | 700²  | .5      | bottom 260, left −260, rotate −12°        |
| `quadratUnten` | 560²  | .28     | bottom −160, right −180, rotate 9°, rx 28 |
| `kreuzGross`   | 300²  | .14     | bottom 900, left −120, rotate 9°          |

All scale by `sc = viewportWidth / 1280`.

**Hue options** (the `KREIS` fill), all four to be implemented:

| Option         | Hex       |
| -------------- | --------- |
| gelb (default) | `#f3e7c9` |
| salbei         | `#dde9db` |
| sand           | `#f0e6d2` |
| flieder        | `#e9e4f1` |

Three rules stated in the source, and they are accessibility constraints:

- Filled shapes may sit under text **only at lightness ≥ 92%**.
- Strokes and glyphs go **only in the card padding**, never under text.
- Salbei for surfaces, moss for the scale, grey for markings.

## Tokens

Lifted from `_Komponenten`, by usage frequency:

| Role            | Hex                   |
| --------------- | --------------------- |
| Ink / text      | `#171a17`             |
| Text muted      | `#4a4e49`             |
| Text soft       | `#6b6d68`             |
| Text lightest   | `#8a8c86`             |
| Page background | `#f4f1ea`             |
| Surface         | `#efece4`             |
| Border          | `#e1dcd1`             |
| Border strong   | `#d6d1c5` / `#c9c5bb` |
| Salbei (accent) | `#3f6b52`             |
| Flieder deep    | `#7a5fb0`             |
| Flieder light   | `#c9b8ea`             |
| Flieder surface | `#e9e4f1`             |

Type: **Manrope** throughout, **Instrument Serif** for editorial headlines.
Body 18px, headlines 56–96px. Content max-width 1200px; artboards drawn at
1280px. Mobile-first — the brief notes media people read on phones.

**Fonts must be self-hosted.** The canvas files hotlink Google Fonts; the brief
requires self-hosting so no cookie banner is needed. That link must not survive
into the build.

## Not site code

- `support.js` — the Design Components canvas runtime, generated from
  `dc-runtime/src/*.ts`. A React renderer for `.dc.html`. Nothing ports.
- `doc-page.js` — paged-document helper, used only by `_Brief`.
- `_Komponenten - Celine Bencker copy.dc.html` — duplicate; ignore.

## When the sources disagree

The canvas has three layers that do not always agree: the brief, the
`_Komponenten` spec, and the rendered boards. The rule used throughout:

- **The boards win on what the page looks like.** They are the decided state.
- **A CVA definition in `_Komponenten` wins inside its component** (classes,
  variants, hover behaviour). Values it leaves open come from the matching
  `ui-*` file.
- **The brief's accessibility floor wins over both** — contrast ≥ 4.5:1,
  keyboard operable, no lost content.

## Divergences, and how each was settled

1. **Stack.** Settled: Astro + Tailwind 4 + CVA, as `_Komponenten` specifies.
2. **URL shape.** The brief §6 says DE at `/`, EN at `/en/`. Built as Tim
   decided later: `/de/` + `/en/`, `/` redirecting to `/de/`.
3. **Missing translations.** The brief §6 says fall back to DE. Built as a
   disabled switcher. See `docs/i18n-policy.md`.
4. **Language-neutral content.** Settled: publications, talks and media are
   single records; only their prose fields are localized.
5. **Header surface.** `_Komponenten` describes the header as bone. All seven
   boards draw it on paper with a hairline below, and only that lets the
   `verwoben` shapes show. Built on paper.
6. **A seventh neutral.** The token list says six colours, but four boards use
   `#f2efe7` for the footer and the open menu, distinctly from bone. Added as
   `bone-soft`.
7. **text-3 darkened to `#666863`.** The spec's `#6b6d68` promises ≥ 4.5:1 but
   holds it only on paper: 4.43 on bone, 4.19 on the lilac tint, about 4.3 over
   every `verwoben` circle hue — where the language switch and the phone
   tagline sit. Five steps darker holds everywhere (lowest 4.52).
8. **The Home band wraps.** Its CVA sets `whitespace-nowrap overflow-hidden`,
   which clips items on narrower screens. It wraps instead; four short items
   on one line stays an authoring rule.
9. **The phone menu opens in place.** `ui-SiteNav` draws a full-screen overlay
   driven by JavaScript. Built as a `<details>` disclosure that pushes the page
   down: no JavaScript, and keyboard focus can never land on content hidden
   behind an overlay.
10. **The band's example items are not used.** "Talk am DGPs Kongress",
    "Neues Paper im British Journal of Psychiatry" and "Interview im Ö1
    Radiokolleg" are specific claims nobody has confirmed. `news.yaml` holds
    placeholders; the examples are kept there as comments.

## Still to confirm before launch

- **Email** `celine.bencker@univie.ac.at` comes from the footer design.
- **Credit link** `https://timbencker.de` comes from an old WordPress export.
- **English copy** on Home and the research teasers is a translation of the
  German draft.
- **Profiles** — only ORCID has a known URL; Scholar, OSF, u:cris and LinkedIn
  appear once their addresses are in `site.yaml`.
- **Nav at tablet width** — between 768px and roughly 1000px the five desktop
  links wrap to two rows. The spec allows one breakpoint only, so this is left
  as is.
