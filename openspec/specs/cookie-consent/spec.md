# cookie-consent Specification

## Purpose
Specifies the cookie consent banner: when it appears, the opt-out default for PostHog statistics, the first-party consent cookie, the settings dialog and the wording of the disclosed services.

## Requirements

### Requirement: Das Banner erscheint, bis eine Entscheidung gespeichert ist
Das Banner MUST am unteren Rand jeder Seite erscheinen, solange kein
Einwilligungs-Cookie `olf_consent` vorliegt. Es SHALL die übrige Seite nicht
blockieren (kein modales Dialogfenster) und MUST als Region mit Überschrift
„Wir verstreuen Kekse!“ / „We’re handing out cookies!“ beschriftet sein.
Nach einer Entscheidung MUST es verschwinden und bleibt bei späteren Besuchen
verborgen.

#### Scenario: Erster Besuch
- **WHEN** eine Besucherin ohne `olf_consent` die Seite öffnet
- **THEN** ist das Banner mit seiner Überschrift sichtbar

#### Scenario: Wiederkehrender Besuch
- **WHEN** ein `olf_consent`-Cookie existiert
- **THEN** ist das Banner nicht gerendert

### Requirement: Abschalten ist so leicht wie Zustimmen
Die erste Ebene des Banners MUST die Aktionen „Her mit den Keksen!“ und
„Keine Statistik-Kekse!“ mit derselben Schaltflächen-Variante zeigen, und die
Aktion „Ich entscheide selbst!“ SHALL die Einstellungen öffnen. Jede Aktion
MUST mit der Tastatur erreichbar sein und einen sichtbaren Fokusrahmen haben.

#### Scenario: Gleiches Gewicht
- **WHEN** das Banner auf der ersten Ebene gerendert wird
- **THEN** haben „Her mit den Keksen!“ und „Keine Statistik-Kekse!“ dieselbe Variante

### Requirement: Die Einstellungen trennen notwendige und Statistik-Kekse
Die Einstellungsansicht MUST zwei Gruppen zeigen. „Notwendige Kekse“ MUST
immer aktiv und nicht umschaltbar sein. „Statistik-Kekse“ MUST standardmäßig
an sein und durch einen Schalter mit `role="switch"` abschaltbar sein. Ein
Speichern-Knopf SHALL die Auswahl übernehmen.

#### Scenario: Notwendige Gruppe ist fest
- **WHEN** die Einstellungen geöffnet werden
- **THEN** ist der Schalter der notwendigen Gruppe deaktiviert und auf „an“

#### Scenario: Statistik ist standardmäßig an
- **WHEN** die Einstellungen ohne gespeicherte Wahl geöffnet werden
- **THEN** ist der Schalter für Statistik-Kekse auf „an“

#### Scenario: Gespeicherte Abschaltung ist sichtbar
- **WHEN** die Einstellungen bei gespeicherter Abschaltung geöffnet werden
- **THEN** ist der Schalter für Statistik-Kekse auf „aus“

### Requirement: Die Entscheidung liegt in einem First-Party-Cookie
Die Entscheidung MUST in einem Cookie `olf_consent` gespeichert werden, das
`Path=/`, `SameSite=Lax` und eine Laufzeit von etwa sechs Monaten hat. Es
MUST nur im Browser geschrieben und gelesen werden. Keine serverseitig
gerenderte oder am Cloudflare-Edge gecachte Antwort SHALL ein `Set-Cookie` für
dieses Cookie enthalten oder vom Cookie abhängen.

#### Scenario: Gecachte Seite bleibt ohne Cookie
- **WHEN** der Server eine Seite rendert
- **THEN** enthält die Antwort kein `Set-Cookie` für `olf_consent`

### Requirement: PostHog erfasst standardmäßig und stoppt nach Abschaltung
PostHog MUST ab dem Seitenstart Ereignisse erfassen, solange keine Abschaltung
gespeichert ist. Bei „Keine Statistik-Kekse!“ oder ausgeschaltetem Schalter
MUST PostHog `opt_out_capturing()` erhalten und das Cookie `analytics: false`
speichern. Bei „Her mit den Keksen!“ oder eingeschaltetem Schalter SHALL
`opt_in_capturing()` aufgerufen werden. Beim Laden der Seite SHALL eine
gespeicherte Wahl angewendet werden, ohne das Cookie erneut zu schreiben.

#### Scenario: Abschalten stoppt die Erfassung
- **WHEN** die Besucherin „Keine Statistik-Kekse!“ wählt
- **THEN** wird PostHog `opt_out_capturing()` mitgeteilt, das Cookie mit `analytics: false` gespeichert und das Banner ausgeblendet

#### Scenario: Gespeicherte Abschaltung gilt bei der nächsten Seite
- **WHEN** ein Cookie mit `analytics: false` vorliegt und die Seite startet
- **THEN** wird PostHog `opt_out_capturing()` mitgeteilt und das Banner bleibt verborgen

#### Scenario: Ohne Entscheidung erfasst PostHog
- **WHEN** kein `olf_consent`-Cookie vorliegt
- **THEN** wird PostHog nicht abgeschaltet

### Requirement: Die Einstellungen lassen sich jederzeit wieder öffnen
Die Fußzeile MUST den Link „Cookie-Einstellungen“ (englisch: „Cookie settings“)
zeigen. Er SHALL das Banner mit den Einstellungen erneut öffnen, und eine
geänderte Wahl MUST das Cookie und die PostHog-Erfassung aktualisieren.

#### Scenario: Erneutes Öffnen
- **WHEN** die Besucherin mit gespeicherter Entscheidung den Link „Cookie-Einstellungen“ aktiviert
- **THEN** wird das Banner gezeigt, und nach dem Speichern verschwindet es wieder

### Requirement: Die Texte nennen nur die tatsächlich eingesetzten Dienste
Der Text MUST das Sprach-Cookie und die Sicherheits-Cookies des Hosters
Cloudflare als notwendig nennen und die anonyme Nutzungsstatistik über
PostHog als optional, standardmäßig an. Er SHALL keine weiteren Anbieter wie
Google oder Facebook erwähnen, weil die Seite keine einsetzt.

#### Scenario: Keine erfundenen Anbieter
- **WHEN** die Texte der Einstellungen gelesen werden
- **THEN** nennen sie PostHog und Cloudflare und sonst keinen Drittanbieter
