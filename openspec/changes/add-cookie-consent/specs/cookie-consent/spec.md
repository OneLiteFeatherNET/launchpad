# cookie-consent Specification

## ADDED Requirements

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

### Requirement: Ablehnen ist so leicht wie Zustimmen
Die ersten Ebene des Banners MUST die Aktionen „Ich nehme alle Kekse!“ und
„Keine Kekse für mich!“ mit derselben Schaltflächen-Variante zeigen, und die
Aktion „Ich entscheide selbst!“ SHALL die Einstellungen öffnen. Jede Aktion
MUST mit der Tastatur erreichbar sein und einen sichtbaren Fokusrahmen haben.

#### Scenario: Gleiches Gewicht
- **WHEN** das Banner auf der ersten Ebene gerendert wird
- **THEN** haben „Ich nehme alle Kekse!“ und „Keine Kekse für mich!“ dieselbe Variante

### Requirement: Die Einstellungen trennen notwendige und Statistik-Kekse
Die Einstellungsansicht MUST zwei Gruppen zeigen. „Notwendige Kekse“ MUST
immer aktiv und nicht umschaltbar sein. „Statistik-Kekse“ MUST standardmäßig
aus sein und durch einen Schalter mit `role="switch"` und `aria-checked` gewählt
werden. Ein Speichern-Knopf SHALL die Auswahl übernehmen.

#### Scenario: Notwendige Gruppe ist fest
- **WHEN** die Einstellungen geöffnet werden
- **THEN** ist der Schalter der notwendigen Gruppe deaktiviert und auf „an“

#### Scenario: Statistik ist standardmäßig aus
- **WHEN** die Einstellungen ohne gespeicherte Wahl geöffnet werden
- **THEN** ist der Schalter für Statistik-Kekse auf „aus“

### Requirement: Die Entscheidung liegt in einem First-Party-Cookie
Die Entscheidung MUST in einem Cookie `olf_consent` gespeichert werden, das
`Path=/`, `SameSite=Lax` und eine Laufzeit von etwa sechs Monaten hat. Es
MUST nur im Browser geschrieben und gelesen werden. Keine serverseitig
gerenderte oder gecachte Antwort SHALL ein `Set-Cookie` für dieses Cookie
enthalten.

#### Scenario: Gecachte Seite bleibt ohne Cookie
- **WHEN** der Server eine Seite rendert
- **THEN** enthält die Antwort kein `Set-Cookie` für `olf_consent`

### Requirement: PostHog erfasst nur nach Zustimmung
Ohne Entscheidung MUST PostHog keine Ereignisse erfassen. Bei „Ich nehme alle
Kekse!“ oder bei aktivierter Statistik MUST die Erfassung aktiviert werden, bei
„Keine Kekse für mich!“ oder deaktivierter Statistik MUST sie abgeschaltet
bleiben. Beim Laden der Seite SHALL die gespeicherte Wahl angewendet werden.

#### Scenario: Ablehnen schaltet ab
- **WHEN** die Besucherin „Keine Kekse für mich!“ wählt
- **THEN** wird PostHog `opt_out_capturing()` mitgeteilt und das Cookie mit `analytics: false` gespeichert

#### Scenario: Gespeicherte Zustimmung gilt bei der nächsten Seite
- **WHEN** ein Cookie mit `analytics: true` vorliegt und die Seite startet
- **THEN** wird PostHog `opt_in_capturing()` mitgeteilt

### Requirement: Die Einstellungen lassen sich jederzeit wieder öffnen
Die Fußzeile MUST den Link „Cookie-Einstellungen“ (englisch: „Cookie settings“)
zeigen. Er SHALL das Banner mit den Einstellungen erneut öffnen, und eine
geänderte Wahl MUST das Cookie und die PostHog-Erfassung aktualisieren.

#### Scenario: Erneutes Öffnen
- **WHEN** die Besucherin mit gespeicherter Entscheidung den Link „Cookie-Einstellungen“ aktiviert
- **THEN** wird das Banner gezeigt, und nach dem Speichern verschwindet es wieder

### Requirement: Die Texte nennen nur die tatsächlich eingesetzten Dienste
Der Text MUST das Sprach-Cookie als notwendig und die anonyme Nutzungsstatistik
über PostHog als optional nennen. Er SHALL keine weiteren Anbieter wie Google
oder Facebook erwähnen, weil die Seite keine einsetzt.

#### Scenario: Keine erfundenen Anbieter
- **WHEN** die Texte der Einstellungen gelesen werden
- **THEN** nennen sie PostHog und sonst keinen Drittanbieter
