# Spec Delta

## Purpose

Besucher sehen auf einer Seite, wie groß die Community ist und wer daran
mitgewirkt hat.

## ADDED Requirements

### Requirement: Die Community-Seite zeigt vier Zahlen
`/<locale>/community` MUST oben Kacheln für Discord-Mitglieder, Teamgröße,
Community-Bauten und Mitwirkende zeigen, als Liste mit Beschriftung und Wert.
Die Teamgröße SHALL die Mitglieder des Rosters ohne offene Positionen zählen,
die Community-Bauten alle Community-POIs der Sprache. Die Kachel der
Discord-Mitglieder MUST entfallen, wenn keine Zahl vorliegt; die Seite
antwortet trotzdem mit 200. Live-Spielerzahlen MUST NOT erscheinen.

#### Scenario: Alle Zahlen vorhanden
- **WHEN** `/de/community` geöffnet wird und der Discord-Abruf gelingt
- **THEN** zeigt die Seite vier Kacheln mit Zahlen

#### Scenario: Discord nicht erreichbar
- **WHEN** der Discord-Abruf fehlschlägt
- **THEN** antwortet die Seite mit 200 und zeigt die übrigen Kacheln

### Requirement: Die Wand zeigt jede Person einmal mit ihren Abzeichen
Unter den Zahlen MUST eine Liste aller Mitwirkenden stehen: Minecraft-Kopf,
Name und je ein Abzeichen pro Beitrag. Ein Abzeichen „Bau“ SHALL auf die
POI-Seite führen, ein Abzeichen „Event“ auf die Event-Seite und die Platzierung
nennen. Fehlen Mitwirkende, MUST der Abschnitt entfallen. Der Kopf ist
dekorativ, weil der Name daneben steht.

#### Scenario: Mehrere Beiträge
- **WHEN** eine Person Bauherr zweier POIs ist
- **THEN** erscheint sie einmal mit zwei Abzeichen, die auf die beiden POIs führen

### Requirement: Die Seite ist eine eigenständige, indexierbare Seite
Die Seite MUST genau einen `h1` tragen, einen Canonical ohne Schrägstrich am
Ende auf sich selbst, hreflang-Alternates für beide Sprachen und einen Eintrag
in der Sitemap. Ihr Inhalt hängt allein am Pfad: keine Query, kein Cookie, kein
Header.

#### Scenario: Canonical und Sitemap
- **WHEN** `/en/community` abgerufen wird
- **THEN** zeigt der Canonical auf `https://onelitefeather.net/en/community`, und die Sitemap listet beide Sprachfassungen

### Requirement: Die Navigation führt zur Seite
Die Hauptnavigation MUST einen Eintrag „Community“ (de und en) enthalten, der
auf die Seite führt und dort als aktuell markiert ist.

#### Scenario: Eintrag sichtbar
- **WHEN** eine beliebige Seite geöffnet wird
- **THEN** enthält die Navigation „Community“ mit Link auf `/<locale>/community`

### Requirement: Die Startseite verweist mit einem Zahlenstreifen
Die Startseite MUST einen schmalen Streifen mit denselben Zahlen zeigen und mit
einem Link auf die Community-Seite versehen.

#### Scenario: Streifen auf der Startseite
- **WHEN** `/de` geöffnet wird
- **THEN** zeigt der Streifen die Zahlen und führt auf `/de/community`
