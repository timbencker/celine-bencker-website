# celine-bencker-website

Zweisprachige Website (Deutsch / Englisch). Statisch gebaut mit
[Astro](https://astro.build), veröffentlicht über GitHub Pages.

---

## Inhalte bearbeiten

Die Texte liegen als einfache Textdateien im Ordner `src/content/pages/`,
getrennt nach Sprache:

```
src/content/pages/
  de/index.md        ->  /de/
  de/forschung.md    ->  /de/forschung
  en/index.md        ->  /en/
  en/research.md     ->  /en/research
```

**Der Dateiname bestimmt die Adresse der Seite.** `forschung.md` wird zu
`/de/forschung`. Datei umbenennen heißt Adresse ändern.

Jede Datei beginnt mit einem Kopfbereich zwischen `---`-Zeilen:

```markdown
---
translationKey: research      # verbindet die deutsche und englische Fassung
title: Forschung              # Überschrift und Browser-Titel
description: Kurzbeschreibung # für Google und beim Teilen von Links
navOrder: 1                   # Position im Menü (weglassen = nicht im Menü)
background: verwoben          # "aus" oder "verwoben"
---

Hier steht der eigentliche Text.
```

Zeilen, die mit `#` beginnen, sind Kommentare — sie erscheinen nicht auf der
Website.

### Zwei Sprachen

Die deutsche und die englische Fassung einer Seite gehören über den gleichen
`translationKey` zusammen. Die Dateinamen dürfen sich unterscheiden
(`forschung.md` und `research.md`) — der `translationKey` ist das Bindeglied.

**Fehlt eine Übersetzung, schlägt der Build fehl.** Das ist Absicht. Wenn eine
Seite bewusst nur in einer Sprache existieren soll, `singleLocale: true` in den
Kopfbereich schreiben. Details: [docs/i18n-policy.md](docs/i18n-policy.md).

---

## Entwicklung

```bash
npm install
npm run dev        # lokaler Server
```

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Build lokal ansehen |
| `npm run check` | Typen und Inhalts-Schemata prüfen |
| `npm run lint` | ESLint inkl. Accessibility-Regeln |
| `npm run format` | Prettier |
| `npm run verify` | check + lint + build |

Node-Version siehe `.nvmrc`.

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/content/pages/<sprache>/` | Seiteninhalte |
| `src/content/data/` | strukturierte Daten (YAML) |
| `src/content.config.ts` | Schema — prüft die Inhalte beim Build |
| `src/i18n/` | Sprachlogik, Übersetzungs-Prüfung |
| `src/layouts/` | Seitengerüst (einmal, für beide Sprachen) |
| `src/components/` | Bausteine |
| `src/styles/tokens.css` | Farben, Schrift, Abstände |
| `docs/i18n-policy.md` | Sprachregeln |

## Veröffentlichen

Jeder Push auf `main` baut und veröffentlicht die Seite automatisch
(`.github/workflows/deploy.yml`).
