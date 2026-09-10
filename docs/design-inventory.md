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

## Open divergences

Tracked in the plan file; listed here so the mapping is in one place.

1. **Stack.** `_Komponenten` states _"Astro · Tailwind ·
   class-variance-authority"_ and defines each component's variants as CVA.
   The scaffold currently uses plain scoped CSS with custom properties.
2. **URL shape.** The brief §6 says DE at `/`, EN at `/en/`. The later
   instruction — and what is built — is `/de/` + `/en/` with `/` redirecting.
3. **Missing translations.** Brief §6 says fall back to DE. The built rule is a
   disabled switcher. See `docs/i18n-policy.md`.
4. **Language-neutral content.** Brief §6: publications, talks and media are
   maintained once, not per language. The current schema is per-locale
   throughout and needs a language-neutral data collection.
