# Proposal: Fest verdrahtete UI-Beschriftungen übersetzen

Ausgeliefert als `fix(i18n)`. Pull-Request-Titel:
`fix(i18n): translate hard-coded ui labels`

## Why

Auf `/en` stehen in den Startseiten-Karussell-Karten deutsche Wörter: der
Button der News-Karte heißt "Mehr", der der Event-Karte "Details" (nur zufällig
gleich geschrieben). Beide sind direkt ins Template geschrieben und umgehen
`t()`. Die bestehenden Tests prüfen `title`/`aria-label`, aber keinen
sichtbaren Text, daher fiel es nicht auf.

## What Changes

- `layers/home/components/CarouselItemNews.vue` und `CarouselItemEvent.vue`
  nutzen `t('carousel.more')` und `t('carousel.details')`; Schlüssel in
  `i18n/locales/en.json` und `de.json`.
- Eine Sweep über `layers/`, `pages/`, `layouts/`, `components/`, `app.vue`,
  `error.vue` fand sonst nur Eigennamen (OneLiteFeather, BlueMap, Discord,
  "MC") und die bewusst deutschen Rechtstexte (`privacy`, `imprint`), die
  unverändert bleiben.
- Ein neuer Test `tests/i18n/hardcoded-text.spec.ts` schlägt an, sobald ein
  Template sichtbaren Klartext außerhalb von `{{ }}` enthält (Ausnahmen:
  Eigennamen, Rechtstexte).

## Capabilities

### New Capabilities

- `i18n-completeness`: sichtbarer Text und zugängliche Namen laufen über i18n.

### Modified Capabilities

Keine.

## Impact

- `layers/home/components/CarouselItem{News,Event}.vue` (nur die Beschriftungszeilen)
- `i18n/locales/{en,de}.json`
- `tests/i18n/hardcoded-text.spec.ts` (neu)
