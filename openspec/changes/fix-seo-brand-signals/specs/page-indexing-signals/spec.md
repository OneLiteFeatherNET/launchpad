# Spec Delta

## Purpose

Was eine Seite über ihre Indexierung sagt, sagt sie überall gleich, und ihr
Titel ist in ihrer Sprache.

## ADDED Requirements

### Requirement: Meta-Robots und X-Robots-Tag stimmen überein
Setzt eine Seite eine Robots-Direktive über `usePageSeo` (`robots`,
`noindex` oder `nofollow`), MUST die SSR-Antwort dieselbe Direktive im
`<meta name="robots">` und im Header `X-Robots-Tag` tragen. Eine Seite DARF
NOT im Meta-Tag `noindex` und im Header `index` sagen oder umgekehrt.

#### Scenario: Dünnes Teamprofil
- **WHEN** ein Teamprofil ohne Bio und Slogan abgerufen wird
- **THEN** ist `<meta name="robots">` `noindex, follow`
- **AND** `X-Robots-Tag` enthält `noindex`

#### Scenario: Ungelistetes Event
- **WHEN** ein Event mit `unlisted: true` abgerufen wird
- **THEN** enthalten Meta-Tag und `X-Robots-Tag` beide `noindex`

#### Scenario: Indexierbare Seite
- **WHEN** ein Teamprofil mit Bio abgerufen wird
- **THEN** enthalten weder Meta-Tag noch `X-Robots-Tag` `noindex`

### Requirement: Deutsche Seitentitel sind deutsch
Ein i18n-Key, der als Seitentitel dient, MUST in `de.json` einen anderen
Wert als in `en.json` haben, außer er steht in einer benannten Ausnahmeliste
mit Begründung (Eigennamen wie `BlueMap`, im Deutschen gebräuchliche
Lehnwörter wie `Community`). Die Events-Übersicht MUST auf Deutsch
„Veranstaltungen“ heißen. Die Blog-Übersicht MUST einen Titel tragen, der
das Wort „Blog“ enthält, nicht nur „Übersicht“ bzw. „Overview“.

#### Scenario: Community-POI
- **WHEN** `/de/community-poi` abgerufen wird
- **THEN** ist der Titel nicht `Community Points of Interest | OneLiteFeather`

#### Scenario: Events-Übersicht
- **WHEN** `/de/events` abgerufen wird
- **THEN** beginnt `<title>` mit `Veranstaltungen`

#### Scenario: Blog-Übersicht
- **WHEN** `/de/blog` abgerufen wird
- **THEN** enthält `<title>` das Wort `Blog`

#### Scenario: Neuer unübersetzter Titel
- **WHEN** jemand einen Titel-Key in `de.json` mit dem englischen Wert anlegt und ihn nicht in die Ausnahmeliste aufnimmt
- **THEN** schlägt der Test fehl und nennt den Key
