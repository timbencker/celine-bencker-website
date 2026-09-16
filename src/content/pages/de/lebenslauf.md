---
translationKey: cv
title: Lebenslauf
description: Lebenslauf von Celine Bencker – Ausbildung, Positionen, Förderungen, Publikationen und Gutachtertätigkeit.
navOrder: 4
# Board 7b: der Lebenslauf bleibt bewusst ohne Hintergrund („Dokumentcharakter“).
background: aus
backgroundHue: gelb

# Die Einträge selbst stehen in src/content/data/cv.yaml, die Publikationen in
# publications.yaml. Hier steht nur der Text der Seite.
cv:
  # Entwurf aus dem Design – von Celine zu prüfen
  # Solange kein PDF unter public/cv-de.pdf liegt, steht `intro` da; sobald es
  # existiert, erscheinen die Download-Knöpfe und `introWithPdf`.
  intro: Ausbildung, Positionen, Förderungen, Lehre und Service.
  introWithPdf: Ausbildung, Positionen, Förderungen, Lehre und Service – vollständig als PDF.

  # Entwurf aus dem Design – von Celine zu prüfen
  # Die Zeilen nennen nur, was die Quellen belegen (ORCID, Crossref).
  strengths:
    heading: Was ich mitbringe
    note: Ergänzend zum Lebenslauf
    items:
      # Design: „Konzeption, Präregistrierung und Durchführung einer EMA-Studie mit
      # Speichelproben über den gesamten Zyklus.“ Belegt ist das Studienprotokoll
      # (BMJ Open 2026, Erstautorin): EMA über zwei Zyklen, Cortisol und
      # Alpha-Amylase aus Speichel, Ethikvotum der Universität Wien,
      # OSF-Präregistrierung. „Konzeption“ und „Durchführung“ bitte bestätigen.
      - title: Feldstudien mit Biomarkern – von der Ethik bis zur Auswertung
        text: Studienprotokoll als Erstautorin – eine präregistrierte EMA-Studie über zwei Menstruationszyklen, mit Cortisol und Alpha-Amylase aus Speichelproben.
      # Design: „…; Review in Frontiers in Neuroendocrinology.“ – Erstautorin dort
      # ist belegt, dass es ein Review ist, nicht (Crossref: nur „journal-article“).
      - title: Evidenzsynthese als Erstautorin
        text: Systematic Review mit drei multilevel Meta-Analysen im British Journal of Psychiatry.
      # Design: „Publikumsvorträge, Medieninterviews und Lehre – Forschung so
      # vermitteln, dass sie außerhalb des Fachs ankommt.“ Nichts davon ist belegt.
      - title: Wissenschaft erklären, auf Deutsch und Englisch
        text: PLATZHALTER – Belege eintragen.

  sections:
    education: Ausbildung
    # Design: „Position“ – mit zwei belegten Stellen im Plural.
    positions: Positionen
    funding: Förderungen & Preise
    publications: Publikationen
    talks: Vorträge & Poster
    teaching: Lehre
    service: Service & Mitgliedschaften

  since: seit
  preprint: Preprint
  reviews:
    title: Reviewerin für Fachzeitschriften
    one: '{n} Gutachten'
    other: '{n} Gutachten'
---
