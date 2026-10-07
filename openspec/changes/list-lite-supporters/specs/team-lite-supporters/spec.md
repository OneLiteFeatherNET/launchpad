## ADDED Requirements

### Requirement: Der Lite-Abschnitt der Team-Seite nennt die Unterstützer
Im Abschnitt „Lite“ von `/<locale>/team` MUST unter der offenen Stelle ein
Unterabschnitt „Unsere Lite-Unterstützer“ (en: „Our Lite supporters“) eine
Liste der Unterstützer zeigen: Avatar und Name. Der Unterabschnitt trägt eine
Überschrift eine Ebene unter der des Rangs (`h3`) und ist als Liste
ausgezeichnet. Ohne Unterstützer MUST er entfallen. Der Avatar ist das
OpenCollective-Bild, sonst ein Platzhalter mit dem Anfangsbuchstaben; er ist
dekorativ, weil der Name daneben steht.

#### Scenario: Unterstützer vorhanden
- **WHEN** `/de/team` mit Unterstützern geöffnet wird
- **THEN** steht im Lite-Abschnitt eine Liste mit je einem Eintrag pro Person unter einer `h3`

#### Scenario: Keine Unterstützer
- **WHEN** die Liste leer ist
- **THEN** zeigt der Lite-Abschnitt nur die offene Stelle, und die Seite antwortet mit 200

### Requirement: Jeder Unterstützer führt zu seiner Karte auf der Community-Wand
Jeder Eintrag MUST auf `/<locale>/community#<anker>` verweisen, wobei der Anker
aus dem Namen des Unterstützers allein folgt und mit dem Anker der Karte auf der
Wand übereinstimmt. Die Wand verweist von dort auf das OpenCollective-Profil.

#### Scenario: Link auf die Wand
- **WHEN** „Marc“ in der Liste steht
- **THEN** führt der Eintrag auf `/de/community#person-marc`, und dort existiert eine Karte mit dieser `id`
