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

Jede Datei besteht aus einem Kopfbereich zwischen zwei `---`-Zeilen. Dort
stehen die Angaben zur Seite und, in benannten Blöcken, der Seitentext selbst:

```markdown
---
translationKey: research # verbindet die deutsche und englische Fassung
title: Forschung # Überschrift und Browser-Titel
description: Kurzbeschreibung # für Google und beim Teilen von Links
navOrder: 1 # Position im Menü (weglassen = nicht im Menü)
background: verwoben # "aus" oder "verwoben"
backgroundHue: salbei # Farbe des Kreises: gelb, salbei, sand oder flieder

# Der Seitentext steht im Block der Seite (hier: research).
research:
  question: Wie hängen Stress, Hormone und prämenstruelle Symptome zusammen?
  # … und die übrigen Felder der Seite (gekürzt)
---
```

Jede Seite hat ihren eigenen Block: `home`, `research`, `publications`, `cv`,
`talksMedia` oder `contact`. Welche Felder darin stehen, zeigen die
Kommentare in der jeweiligen Datei.

**Unter der zweiten `---`-Zeile bleibt die Datei leer.** Jede Seite, die es
heute gibt, hat ihre eigene Gestaltung, und die zeigt nur die Blöcke aus dem
Kopfbereich. Text darunter erschiene also nirgends; damit er nicht unbemerkt
verloren geht, bricht der Build ab und nennt die Datei — er gehört in den
passenden Block. Nur bei einer neuen Seite, für die es noch keine eigene
Gestaltung gibt, erscheint dieser Text: als schlichter Entwurf.

Im Kopfbereich sind Zeilen, die mit `#` beginnen, Kommentare — sie erscheinen
nicht auf der Website. Unter der zweiten `---`-Zeile macht `#` dagegen eine
Überschrift.

### Listen: Publikationen, Vorträge, Lebenslauf …

Forschungslinien, Publikationen, Vorträge, Medienbeiträge, Lebenslauf und
Neuigkeiten stehen einmal für beide Sprachen in `src/content/data/*.yaml`.
Oben in jeder Datei erklären Kommentare die Felder und zeigen eine Vorlage.

**Ein Tippfehler in einer dieser Dateien stoppt den Build**, und
`npm run dev` startet nicht. Die Meldung nennt die Datei und meist die Stelle,
z. B. `(4:1)` für Zeile 4, Spalte 1. Genauso stoppt ein Eintrag ohne `id` oder
eine `id`, die zweimal vorkommt. Läuft `npm run dev` schon, erscheint die
Meldung im Terminal.

Eine leere Liste bleibt `[]` — eine Datei nur mit Kommentaren reicht nicht.
Leer sein darf derzeit nur `media.yaml`.

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

| Befehl                 | Zweck                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Entwicklungsserver                                                 |
| `npm run build`        | Produktions-Build nach `dist/`                                     |
| `npm run preview`      | Build lokal ansehen                                                |
| `npm run check`        | Typen und Inhalts-Schemata prüfen                                  |
| `npm run lint`         | ESLint inkl. Accessibility-Regeln, dazu die Breakpoint-Namen       |
| `npm run format`       | Prettier                                                           |
| `npm run verify`       | check + lint + test:unit + build                                   |
| `npm run test:unit`    | Prüfregeln für Datendateien, Seitentexte und Veröffentlichungsziel |
| `npm run test:e2e`     | Barrierefreiheit und Links prüfen (siehe `tests/README.md`)        |
| `npm run lighthouse`   | Lighthouse-Werte jeder Seite prüfen, Ziel ≥ 95                     |
| `npm run check:launch` | Zeigt, was vor dem Veröffentlichen noch fehlt (liest `dist/`)      |

Node-Version siehe `.nvmrc`.

## Struktur

| Pfad                           | Inhalt                                    |
| ------------------------------ | ----------------------------------------- |
| `src/content/pages/<sprache>/` | Seiteninhalte                             |
| `src/content/data/`            | strukturierte Daten (YAML)                |
| `src/content/schemas/`         | Schemata — prüfen die Inhalte beim Build  |
| `src/content.config.ts`        | verbindet Inhalte und Schemata            |
| `src/i18n/`                    | Sprachlogik, Übersetzungs-Prüfung         |
| `src/layouts/`                 | Seitengerüst (einmal, für beide Sprachen) |
| `src/components/`              | Bausteine                                 |
| `src/styles/tokens.css`        | Farben, Schrift, Abstände                 |
| `docs/i18n-policy.md`          | Sprachregeln                              |

## Veröffentlichen

Veröffentlicht wird nur von Hand, nie durch einen Push: auf GitHub unter
**Actions → „Deploy to GitHub Pages“ → „Run workflow“**
(`.github/workflows/deploy.yml`).

Der Ablauf führt zuerst alle Prüfungen aus. Er veröffentlicht nichts, solange
die Website noch `PLATZHALTER`-Text enthält oder den Hinweis, dass das
Impressum noch nicht rechtlich geprüft ist (`imprint.reviewNote` in
`kontakt.md` und `contact.md` — nach der Prüfung entfernen). Was noch fehlt,
zeigt `npm run check:launch` nach einem `npm run build`, Datei für Datei.
