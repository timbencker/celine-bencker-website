---
translationKey: research
title: Forschung
description: Forschungslinien, Methoden und laufende Projekte – fachlich und einfach erklärt.
navOrder: 1
background: verwoben
backgroundHue: salbei

# Seitentexte der Forschungsseite. Die drei Forschungslinien – Texte in beiden
# Fassungen, Begriffe, Paper und die Studie – stehen in
# src/content/data/research.yaml.
research:
  # Entwurf aus dem Design – von Celine zu prüfen
  question: Wie hängen Stress, Hormone und prämenstruelle Symptome zusammen?

  # Der Umschalter im Seitenkopf. Er schaltet die ganze Seite um, ohne JavaScript.
  register:
    label: Diese Seite in zwei Fassungen
    expert: Fachlich
    plain: Einfach erklärt
    # Das Motto aus dem Brief; erscheint nur bei „Einfach erklärt".
    motto: So einfach wie möglich – und immer noch richtig.

  # Beschriftung der schematischen Zyklusgrafik im Studienkasten.
  graphic:
    start: Tag 1
    ovulation: Eisprung
    end: Tag 28
    estradiol: Östradiol
    progesterone: Progesteron

  methods:
    heading: Methoden
    # Beschreibungen: Entwurf aus dem Design – von Celine zu prüfen.
    # `doi` muss einer der geprüften DOIs sein (src/content/schemas/research.ts);
    # `label` nennt das Paper wie im Design.
    items:
      # Design: „… über einen ganzen Zyklus – ausgewertet mit Mehrebenenmodellen
      # in R." Das Studienprotokoll nennt zwei Zyklen; „in R" belegt keine Quelle.
      - title: Ecological Momentary Assessment
        text: Stress, Stimmung und Symptome mehrmals täglich im Alltag erfasst, über den Zyklus hinweg – ausgewertet mit Mehrebenenmodellen.
        doi: 10.1136/bmjopen-2026-123210
        label: Studienprotokoll
      - title: Psychobiologische Stressmarker
        text: Speichelcortisol und Alpha-Amylase zeigen, wie der Körper auf Stress reagiert – unabhängig vom Selbstbericht.
        doi: 10.1136/bmjopen-2026-123210
        label: Studienprotokoll
      # „Dutzende Studien": BJPsych 2025 fasst 188 Effekte aus 66 Studien zusammen.
      - title: Multilevel-Meta-Analyse
        text: Fasst dutzende Studien mit mehreren Effekten pro Studie korrekt zusammen.
        doi: 10.1192/bjp.2025.10311
        label: BJPsych 2025
      - title: Netzwerkanalyse
        text: Zeigt, welche Emotionen und Ressourcen sich gegenseitig verstärken – und testet damit Theorien.
        doi: 10.3389/fpsyg.2024.1405272
        label: Front. Psychol. 2024
      # Design: „Die gesamte Literatur nach festen Regeln (PRISMA) gesichtet …".
      # PRISMA nennt keine geprüfte Quelle; die Vorregistrierung (PROSPERO) nennt
      # das BJPsych-Abstract.
      - title: Systematische Reviews
        text: Die Literatur nach festen, vorab registrierten Regeln gesichtet, damit das Ergebnis nicht von der Auswahl abhängt.
        doi: 10.1192/bjp.2025.10311
        label: BJPsych 2025

  collaboration:
    heading: Zusammenarbeit
    # Satz 1: Entwurf aus dem Design – von Celine zu prüfen.
    # Satz 2: Institut und Forschungsplattform aus den Crossref-Angaben zum
    #   Studienprotokoll (ORCID: „Department of Clinical and Health Psychology,
    #   University of Vienna"); die deutsche Bezeichnung des Instituts ist eine
    #   Übersetzung – von Celine zu bestätigen. Uppsala: Mitautorin Erika Comasco
    #   (Uppsala University) am Studienprotokoll. Das Design nennt außerdem
    #   Salzburg und „die Gruppe Klinische Psychologie" – beides belegt keine
    #   geprüfte Quelle.
    # Satz 3: ORCID-Förderung, Austrian Academy of Sciences, 10/2023–09/2026.
    #   Design: „Gefördert durch ein DOC-Stipendium der Österreichischen Akademie
    #   der Wissenschaften." – „DOC" nennt ORCID nicht.
    text: >-
      Offen für gemeinsame Auswertungen von Alltags- und Hormondaten,
      Meta-Analysen und Gastvorträge. Ich arbeite am Institut für Klinische und
      Gesundheitspsychologie der Universität Wien und in der Forschungsplattform
      „Stress of Life (SOLE)“, mit Kooperationen unter anderem nach Uppsala. Von
      2023 bis 2026 gefördert von der Österreichischen Akademie der Wissenschaften
      (ÖAW).
---
