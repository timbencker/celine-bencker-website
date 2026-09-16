---
translationKey: contact
title: Kontakt
description: Kontakt zu Celine Bencker – Mail, Institut und Profile, dazu das Impressum.
navOrder: 5
background: verwoben
backgroundHue: sand

# Die Mail-Adresse selbst steht nicht hier, sondern in
# src/content/data/site/site.yaml. Die Seite gibt sie verschleiert aus.
contact:
  # Entwurf aus dem Design – von Celine zu prüfen
  intro: Für Kooperationen, Interviews, Vorträge oder Fragen zur ISSAC-Studie.
  # Zusage zur Antwortzeit – erscheint erst, wenn Celine sie bestätigt.
  # Beispiel aus dem Design:
  # replyNote: Ich antworte meist innerhalb eines Werktags.

  # Vorgelesener Name der drei Kacheln (sie haben keine sichtbare Überschrift).
  reasonsLabel: Anliegen

  # Drei Wege. `subject` = Mail mit vorausgefülltem Betreff;
  # `to` = eine Seite (translationKey), `anchor` = ein Abschnitt darauf.
  # Entwurf aus dem Design – von Celine zu prüfen
  reasons:
    - eyebrow: Forschung & Kooperation
      title: Gemeinsame Auswertungen, Meta-Analysen, Gastvorträge
      action: Mail schreiben
      subject: Kooperation
    - eyebrow: Medien & Vorträge
      title: Interviews, Podcasts, Publikums- und Fachvorträge
      # Im Design: „Pressekit & Themen". Ein Pressekit gibt es noch nicht;
      # sobald es auf der Seite „Vorträge & Medien" liegt, wieder so nennen.
      action: Themen für Redaktionen
      to: talks-media
    - eyebrow: ISSAC-Studie
      # „Teilnehmen" nur, solange die Studie Teilnehmende sucht – bitte bestätigen.
      title: Teilnehmen oder Fragen zur Studie
      action: Zur Studie
      to: research
      anchor: stress-im-alltag

  institute:
    heading: Institut
    # Laut ORCID (Anstellung): „University of Vienna".
    organisation: Universität Wien
    # Laut ORCID: „Department of Clinical and Health Psychology".
    # Deutsche Namensform übersetzt – von Celine zu prüfen
    department: Institut für Klinische und Gesundheitspsychologie
    # Die Straßenadresse steht in keiner geprüften Quelle.
    # Beispiel aus dem Design: Liebiggasse 5, 1010 Wien
    address: PLATZHALTER – Postanschrift des Instituts
    # Die Profile selbst kommen aus site.yaml (derzeit ORCID und u:cris).
    profilesHeading: Profile

  # Impressum nach österreichischem Recht (MedienG § 25; ob zusätzlich
  # ECG § 5 gilt, ist zu klären). Alles darunter ist ein Rechtstext-Entwurf –
  # vor der Veröffentlichung rechtlich prüfen lassen.
  imprint:
    # Entfernen, sobald der Text geprüft ist.
    reviewNote: PLATZHALTER – Rechtstext-Entwurf, noch nicht rechtlich geprüft.
    # Rechtstext-Entwurf – prüfen
    ownerLabel: Medieninhaberin und Herausgeberin
    # Name laut ORCID. Grad laut ORCID-Ausbildung: „Master of Science",
    # Universität Wien, 2022. Schreibweise des Namens mit Grad – von Celine zu prüfen
    ownerName: Celine Bencker, MSc
    # In keiner geprüften Quelle. Im Design: „Adresse (Platzhalter)".
    ownerAddress: PLATZHALTER – Wohnort bzw. Anschrift der Medieninhaberin
    # Rechtstext-Entwurf aus dem Design – jeder Satz prüfen
    mediaLaw:
      - Persönliche, nicht-kommerzielle Website nach § 25 MedienG.
      - Inhalte geben ausschließlich meine Auffassung wieder, nicht die der Universität Wien.
    # Rechtstext-Entwurf – prüfen
    privacyLabel: Datenschutz
    # Rechtstext-Entwurf – jeder Satz prüfen. Beschreibt die Seite, wie sie
    # gebaut ist: keine Cookies, keine Tracker, Schriften selbst gehostet,
    # die Sprachwahl im localStorage (nur beim Klick auf den Umschalter).
    # Die IP-Protokollierung durch GitHub: GitHub Docs, „What is GitHub
    # Pages?", Abschnitt „Data collection".
    privacy:
      - Diese Seite setzt keine Cookies, verwendet keine Tracker und lädt Schriften vom eigenen Server.
      - Ein Wechsel der Sprache wird nur im eigenen Browser gespeichert (localStorage), damit die Startadresse beim nächsten Aufruf in dieser Sprache öffnet; an den Server wird diese Angabe nicht übertragen.
      - Die Seite wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc. (USA).
      - Beim Aufruf verarbeitet GitHub die dafür technisch notwendigen Verbindungsdaten; laut GitHub wird dabei die IP-Adresse der Besucher:innen zu Sicherheitszwecken protokolliert und gespeichert.
---
