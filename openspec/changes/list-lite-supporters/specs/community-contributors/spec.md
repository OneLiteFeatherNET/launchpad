## MODIFIED Requirements

### Requirement: Nur öffentlich genannte Personen sind Mitwirkende
Mitwirkende MUST sich ausschließlich aus den `builders` der Community-POIs, den
`results.placements` von Events und den Lite-Unterstützern von OpenCollective
ergeben, die auf der Website ohnehin stehen. Ein Event SHALL nur zählen, wenn es
gelistet (nicht `unlisted`, nicht verborgen) und vorbei ist; die Platzierungen
eines unveröffentlichten oder nicht gelisteten Events MUST NOT in Wand, Zahl
oder Payload gelangen. Teammitglieder erscheinen genau dann, wenn sie in
`builders`, `placements` oder der Unterstützerliste stehen.

#### Scenario: Verborgenes Event
- **WHEN** ein Event verborgen oder `unlisted` ist und Platzierungen trägt
- **THEN** erscheint keine seiner Personen durch dieses Event

#### Scenario: Laufendes Event
- **WHEN** ein Event noch läuft
- **THEN** zählen seine Platzierungen nicht

#### Scenario: Unterstützer
- **WHEN** die Unterstützerliste „Marc“ enthält
- **THEN** erscheint „Marc“ als Mitwirkender mit dem Abzeichen „Unterstützer“

### Requirement: Eine Person erscheint einmal
Beiträge MUST nach `mcName` ohne Beachtung der Groß-/Kleinschreibung
zusammengeführt werden, ohne `mcName` nach dem Namen. Ein Unterstützer MUST mit
einer vorhandenen Person zusammengeführt werden, deren `mcName` oder `name`
ohne Beachtung der Schreibweise seinem Namen entspricht, und trägt dann
zusätzlich das Abzeichen „Unterstützer“. Der angezeigte Name SHALL der des
ersten Beitrags sein. Die Wand ist nach Anzahl der Beiträge absteigend, dann
nach Namen sortiert; die Zahl „Mitwirkende“ ist die Länge dieser Liste und
schließt Unterstützer ein.

#### Scenario: Unterschiedliche Schreibweise
- **WHEN** `mcName` einmal `Blndr2` und einmal `blndr2` lautet
- **THEN** ist es eine Person

#### Scenario: Ohne mcName
- **WHEN** ein Eintrag nur `name` trägt
- **THEN** wird nach dem kleingeschriebenen Namen zusammengeführt

#### Scenario: Unterstützer und Bauherr
- **WHEN** der Unterstützer „Blndr2“ heißt und ein Bauherr den `mcName` `blndr2` trägt
- **THEN** ist es eine Karte mit den Abzeichen „Bau“ und „Unterstützer“

## ADDED Requirements

### Requirement: Jede Person trägt einen stabilen Anker
Jeder Mitwirkende MUST einen Anker `person-<slug>` tragen, den die Wand als `id`
setzt. Bei Personen, die auch Unterstützer sind, folgt der Anker aus dem Namen
des Unterstützers, sonst aus dem Schlüssel der Person.

#### Scenario: Anker aus dem Unterstützernamen
- **WHEN** der Unterstützer „Bünyamin Arif“ heißt
- **THEN** lautet der Anker `person-bunyamin-arif`

## REMOVED Requirements

### Requirement: Unterstützer von OpenCollective sind eine Zahl
**Reason**: Die öffentliche Mitgliederliste von OpenCollective nennt Namen; die
Unterstützer sind jetzt Mitwirkende der Wand.
**Migration**: Siehe die geänderten Anforderungen „Nur öffentlich genannte
Personen sind Mitwirkende“ und „Eine Person erscheint einmal“.
