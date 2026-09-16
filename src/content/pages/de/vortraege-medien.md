---
translationKey: talks-media
title: Vorträge & Medien
# Entwurf – von Celine zu prüfen
description: Vorträge und Konferenzbeiträge von Celine Bencker, Themen für Interviews und der Kontakt für Redaktionen.
navOrder: 3
background: verwoben
backgroundHue: flieder

# Die Überschrift bricht am Desktop nach „Vorträge", wie im Design.
hero:
  lines:
    - Vorträge
    - '& Medien'
  # Entwurf aus dem Design – von Celine zu prüfen
  lead: Forscht an der Universität Wien zu Stress, Hormonen und prämenstruellen Symptomen – und erklärt es so, dass man es versteht.

talksMedia:
  # Die Themen als Fragen, rechts neben der Überschrift.
  themes:
    label: Themen
    # Entwurf aus dem Design – von Celine zu prüfen
    items:
      - Warum ist PMS mehr als schlechte Laune?
      - Was macht Stress mit dem Zyklus – und umgekehrt?
      - Wie verändert die Pille Stimmung und Stressempfinden?

  # Der Zitatblock direkt unter der Überschrift. Das Zitat selbst steht in
  # src/content/data/media.yaml (Feld `quote`) und muss echt und von Celine
  # freigegeben sein. Bis dahin erscheinen die beiden Platzhalter.
  # Das Beispiel im Design ist nicht belegt und steht als Kommentar in media.yaml.
  quote:
    placeholder: PLATZHALTER – ein freigegebenes Zitat aus einem Interview
    photo: PLATZHALTER – Pressefoto, 4:5, Druckqualität
    listen: Ausschnitt anhören

  # Die Vorträge kommen aus src/content/data/talks.yaml. Ob ein Eintrag
  # unter „Nächste Talks" oder „Bisherige Beiträge" steht, ergibt sich beim
  # Build aus dem Datum; eine leere Liste erscheint nicht.
  talks:
    upcomingHeading: Nächste Talks
    pastHeading: Bisherige Beiträge
    formats:
      conference-presentation: Konferenzvortrag
      conference-poster: Posterbeitrag
      public-talk: Publikumsvortrag
      abstract: Abstract

  # Die Beiträge kommen aus src/content/data/media.yaml. Solange die Liste
  # leer ist, steht hier der Platzhalter; ohne `placeholder` entfällt der
  # Abschnitt, bis der erste Beitrag eingetragen ist.
  media:
    heading: In den Medien
    placeholder: PLATZHALTER – Medienbeiträge (Liste von Celine)
    formats:
      interview: Interview
      guest-article: Gastbeitrag
      podcast: Podcast
      radio: Radio
      tv: Fernsehen
      print: Print
      online: Online

  # „Für Redaktionen" – der einzige lila Abschnitt der Website. Die Adresse
  # kommt aus site.yaml. Die Adresse im Design liegt auf einer Domain, die es
  # noch nicht gibt, und wird deshalb nicht verwendet.
  press:
    heading: Für Redaktionen
    # Entwurf – von Celine zu prüfen
    intro: Anfragen zu Interviews, Hintergrundgesprächen und Vorträgen gerne per Mail.
    # Im Design: „Radio · Print · Podcast · Bühne · Antwort meist innerhalb
    # eines Werktags" – Formate und Antwortzeit von Celine bestätigen lassen.
    note: PLATZHALTER – Formate und übliche Antwortzeit
    # Der Button „Pressekit ↓" erscheint erst, wenn die Datei unter
    # public/presse/pressekit.zip liegt – dann mit Format und echter Größe.
    kit:
      file: presse/pressekit.zip
      label: Pressekit
      # Entwurf aus dem Design – erscheint nur zusammen mit der Datei.
      contents: Kurzbio (DE/EN), Themenliste und Pressefoto in Druckqualität.
---
