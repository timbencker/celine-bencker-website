---
translationKey: publications
title: Publikationen
description: Fachartikel von Celine Bencker nach Jahren, mit DOI-Links und einer BibTeX-Datei.
navOrder: 2
# Das Design zeigt hier nur die Skala am rechten Rand (Rezept „pub“), keine Flächen.
background: verwoben
backgroundHue: gelb

# Die Arbeiten selbst stehen in src/content/data/publications.yaml.
publications:
  # Download neben dem Titel. Die Dateigröße misst der Build.
  bibtex:
    label: BibTeX
    format: .bib

  # Gruppe über den Jahren. Bisher ist kein eingereichtes Manuskript bestätigt.
  # Beispiele aus dem Design – nicht geprüft, erst eintragen, wenn Celine sie freigibt:
  #   „Psychobiologische Stressreaktivität über den Menstruationszyklus – erste
  #   Ergebnisse der ISSAC-Studie“ · Erstautorin · Empirische Arbeit · in Begutachtung
  #   „Platzhalter – weiteres Manuskript“ · Ko-Autorin · in Vorbereitung
  # Gibt es keine, den ganzen Block `submitted` löschen – dann entfällt die Gruppe.
  submitted:
    heading: Eingereicht
    items:
      - title: PLATZHALTER – Titel eines eingereichten Manuskripts
        sub: PLATZHALTER – Rolle · Art der Arbeit
        status: PLATZHALTER
---
