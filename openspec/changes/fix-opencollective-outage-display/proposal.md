# Proposal: Spendenziel bei Ausfall der OpenCollective-Statistik ausblenden

Ausgeliefert als `fix(opencollective)`. Pull-Request-Titel:
`fix(opencollective): hide the funding goal when the stats are unavailable`

## Why

Fällt die OpenCollective-API aus, antwortet `server/api/opencollective.get.ts`
mit Platzhalterwerten (`totalRaised: 0`, Ziel 3000 EUR), und
`useOpenCollective` baut bei einem Fehler denselben Platzhalter. Die
Startseite zeigt dann „0 von 3000 EUR“, als wäre es der echte Stand. Das
HTML der Startseite liegt bis zu eine Stunde (plus stale-while-revalidate) im
Edge-Cache; ein kurzer Ausfall steht so lange sichtbar auf der Seite, und
jeder Besucher sieht einen scheinbar leeren Spendentopf.

## What Changes

- Die API unterscheidet „nicht verfügbar“ von einem echten Nullstand: Die
  Antwort trägt `available: true` mit den Zahlen oder `available: false`
  ohne Zahlen. Eine Antwort ohne numerisches `balance` zählt als Ausfall.
- Die Startseite blendet den Abschnitt „Spendenziel“ bei `available: false`
  ganz aus, statt Nullen oder einen Call-to-Action ohne Zahlen zu zeigen.
- Im Browser holt `useOpenCollective` die Zahlen nach dem Hydrieren erneut,
  wenn die Server-Antwort „nicht verfügbar“ war. So heilt eine
  zwischengespeicherte Ausfall-Seite, ohne dass das Rendern Anfrage-Daten liest.
- Der Fehler-Log nennt Slug und Fehlermeldung statt nur ein Fehlerobjekt.

## Capabilities

### New Capabilities

- `opencollective-stats`: Die Spendenstatistik zeigt nur echte Zahlen und
  blendet sich bei einem Ausfall der Quelle aus.

### Modified Capabilities

Keine.

## Impact

- `server/api/opencollective.get.ts`, `shared/utils/openCollective.ts`,
  `layers/opencollective/types.ts`,
  `layers/opencollective/composables/useOpenCollective.ts`,
  `pages/index.vue`
- Tests unter `tests/shared/`, `tests/opencollective/`
- Keine neuen Abhängigkeiten, keine `routeRules`- oder Nitro-Cache-Änderung.
