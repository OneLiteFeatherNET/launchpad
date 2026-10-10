# Spec Delta

## Purpose

Welche Personen als Mitwirkende gelten und wie ihre Beiträge zusammengeführt
werden.

## ADDED Requirements

### Requirement: Nur öffentlich genannte Personen sind Mitwirkende
Mitwirkende MUST sich ausschließlich aus den `builders` der Community-POIs und
den `results.placements` von Events ergeben, die auf der Website ohnehin
stehen. Ein Event SHALL nur zählen, wenn es gelistet (nicht `unlisted`,
nicht verborgen) und vorbei ist; die Platzierungen eines unveröffentlichten
oder nicht gelisteten Events MUST NOT in Wand, Zahl oder Payload gelangen.
Teammitglieder erscheinen genau dann, wenn sie in `builders` oder
`placements` stehen.

#### Scenario: Verborgenes Event
- **WHEN** ein Event verborgen oder `unlisted` ist und Platzierungen trägt
- **THEN** erscheint keine seiner Personen durch dieses Event

#### Scenario: Laufendes Event
- **WHEN** ein Event noch läuft
- **THEN** zählen seine Platzierungen nicht

### Requirement: Eine Person erscheint einmal
Beiträge MUST nach `mcName` ohne Beachtung der Groß-/Kleinschreibung
zusammengeführt werden, ohne `mcName` nach dem Namen. Der angezeigte Name SHALL
der des ersten Beitrags sein. Die Wand ist nach Anzahl der Beiträge absteigend,
dann nach Namen sortiert; die Zahl „Mitwirkende“ ist die Länge dieser Liste.

#### Scenario: Unterschiedliche Schreibweise
- **WHEN** `mcName` einmal `Blndr2` und einmal `blndr2` lautet
- **THEN** ist es eine Person

#### Scenario: Ohne mcName
- **WHEN** ein Eintrag nur `name` trägt
- **THEN** wird nach dem kleingeschriebenen Namen zusammengeführt

### Requirement: Unterstützer von OpenCollective sind eine Zahl
Da die öffentliche OpenCollective-Schnittstelle keine Namen liefert, MUST die
Seite die Unterstützer nur als Zahl zeigen, falls vorhanden, und sie NICHT in
die Zahl der Mitwirkenden einrechnen.

#### Scenario: Zahl ohne Namen
- **WHEN** OpenCollective eine Zahl von Unterstützern meldet
- **THEN** erscheint sie als eigene Kachel, und die Wand bleibt unverändert
