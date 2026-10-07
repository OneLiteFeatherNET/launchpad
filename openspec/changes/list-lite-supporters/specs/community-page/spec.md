## MODIFIED Requirements

### Requirement: Die Community-Seite zeigt Zahlen, die die Community abbilden
`/<locale>/community` MUST oben Kacheln für Discord-Mitglieder, Teamgröße,
Community-Bauten, Unterstützer und Mitwirkende zeigen, als Liste mit
Beschriftung und Wert. Eine Kachel, deren Wert fehlt (`null`) oder `0` ist,
MUST entfallen. Die Kachel „Mitwirkende“ SHALL nur erscheinen, wenn die Zahl
(einschließlich der Unterstützer) mindestens `MIN_CONTRIBUTORS_SHOWN` (10)
beträgt; die Wand bleibt davon unberührt, ihr Einleitungstext nennt keine Zahl.
Die Kachel „Unterstützer“ SHALL die Länge der Unterstützerliste zeigen, die
auch die Team-Seite nennt, und nur bei leerer Liste auf die Zahl von
OpenCollective zurückfallen. Die Teamgröße SHALL die Mitglieder des Rosters ohne
offene Positionen zählen, die Community-Bauten alle Community-POIs der Sprache.
Die Kachel der Discord-Mitglieder MUST entfallen, wenn keine Zahl vorliegt; die
Seite antwortet trotzdem mit 200. Live-Spielerzahlen MUST NOT erscheinen.

#### Scenario: Alle Zahlen vorhanden
- **WHEN** `/de/community` geöffnet wird, der Discord-Abruf gelingt und es mindestens zehn Mitwirkende gibt
- **THEN** zeigt die Seite fünf Kacheln mit Zahlen

#### Scenario: Zu wenige Mitwirkende
- **WHEN** weniger als zehn Mitwirkende vorliegen
- **THEN** entfällt die Kachel „Mitwirkende“, und die Wand zeigt weiter jede Person

#### Scenario: Discord nicht erreichbar
- **WHEN** der Discord-Abruf fehlschlägt
- **THEN** antwortet die Seite mit 200 und zeigt die übrigen Kacheln

#### Scenario: Unterstützerliste leer
- **WHEN** die Unterstützerliste leer ist und OpenCollective `backersCount` 29 meldet
- **THEN** zeigt die Kachel „Unterstützer“ 29

### Requirement: Die Wand zeigt jede Person einmal mit ihren Abzeichen
Unter den Zahlen MUST eine Liste aller Mitwirkenden stehen: Avatar, Name und je
ein Abzeichen pro Beitrag. Ein Abzeichen „Bau“ SHALL auf die POI-Seite führen,
ein Abzeichen „Event“ auf die Event-Seite und die Platzierung nennen, ein
Abzeichen „Unterstützer“ auf das OpenCollective-Profil. Jede Karte MUST ihren
Anker als `id` tragen. Der Avatar ist der Minecraft-Kopf bei Personen mit
`mcName`, sonst das OpenCollective-Bild, sonst bei reinen Unterstützern ein
Platzhalter mit Anfangsbuchstaben. Fehlen Mitwirkende, MUST der Abschnitt
entfallen. Der Avatar ist dekorativ, weil der Name daneben steht.

#### Scenario: Mehrere Beiträge
- **WHEN** eine Person Bauherr zweier POIs ist
- **THEN** erscheint sie einmal mit zwei Abzeichen, die auf die beiden POIs führen

#### Scenario: Bauherr und Unterstützer
- **WHEN** eine Person Bauherr und Unterstützer ist
- **THEN** zeigt ihre Karte beide Abzeichen, und das Abzeichen „Unterstützer“ führt auf ihr OpenCollective-Profil

#### Scenario: Anker
- **WHEN** die Wand gerendert wird
- **THEN** trägt jede Karte eine eindeutige `id` der Form `person-<slug>`
