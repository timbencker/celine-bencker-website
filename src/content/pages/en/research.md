---
translationKey: research
title: Research
description: Research lines, methods and current projects – for specialists and in plain language.
navOrder: 1
background: verwoben
backgroundHue: salbei

# Page copy for Research. The three research lines – both versions of their
# text, terms, papers and the study – live in src/content/data/research.yaml.
# EN: Übersetzung – von Celine zu prüfen (the whole block translates the German
# draft; sources and open points are noted in the German file).
research:
  question: How are stress, hormones and premenstrual symptoms connected?

  # The toggle in the page header. It switches the whole page, without JavaScript.
  register:
    label: This page in two versions
    expert: Specialist
    plain: Plain language
    # The brief's motto; shown in the plain version only.
    motto: As simple as possible – and still correct.

  # Labels inside the schematic cycle graphic in the study block.
  graphic:
    start: Day 1
    ovulation: Ovulation
    end: Day 28
    estradiol: Estradiol
    progesterone: Progesterone

  methods:
    heading: Methods
    # `doi` must be one of the verified DOIs (src/content/schemas/research.ts).
    items:
      - title: Ecological momentary assessment
        text: Stress, mood and symptoms recorded several times a day in everyday life, across the cycle – analysed with multilevel models.
        doi: 10.1136/bmjopen-2026-123210
        label: Study protocol
      - title: Psychobiological stress markers
        text: Salivary cortisol and alpha-amylase show how the body responds to stress – independent of self-report.
        doi: 10.1136/bmjopen-2026-123210
        label: Study protocol
      - title: Multilevel meta-analysis
        text: Combines dozens of studies correctly, even when each contributes several effects.
        doi: 10.1192/bjp.2025.10311
        label: BJPsych 2025
      - title: Network analysis
        text: Shows which emotions and resources reinforce each other – and so puts theories to the test.
        doi: 10.3389/fpsyg.2024.1405272
        label: Front. Psychol. 2024
      - title: Systematic reviews
        text: The literature searched by fixed, preregistered rules, so the result does not depend on what was picked.
        doi: 10.1192/bjp.2025.10311
        label: BJPsych 2025

  collaboration:
    heading: Collaboration
    # Department and platform as in the Crossref record of the study protocol
    # and in ORCID; Uppsala from co-author Erika Comasco (Uppsala University);
    # funding from ORCID (Austrian Academy of Sciences, 10/2023–09/2026).
    text: >-
      Open to joint analyses of everyday-life and hormone data, meta-analyses
      and guest talks. I work at the Department of Clinical and Health
      Psychology, University of Vienna, and in the research platform “Stress of
      Life (SOLE)”, with collaborators in Uppsala, among others. Funded by the
      Austrian Academy of Sciences (ÖAW) from 2023 to 2026.
---
