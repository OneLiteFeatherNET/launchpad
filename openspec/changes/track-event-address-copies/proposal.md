# Proposal: Kopieren der Serveradresse als Konversion erfassen

Ausgeliefert als `feat(events)`. PR-Titel:
`feat(events): track server address copies as a posthog conversion`

## Why

Die Halloween-Kampagne verlinkt mit `utm_campaign=halloween-2026` auf die
Event-Seiten. Ob sie wirkt, zeigt sich daran, wer danach die Serveradresse
kopiert — der Schritt direkt vor dem Spielen. Heute erreicht dieser Klick
PostHog nur als generischer Autocapture-Klick
(`data-ph-capture-attribute-name="event-server-address"`), ohne Bezug zum
Event, ohne Sprache und auch dann, wenn das Kopieren gar nicht gelang. Ein
Funnel „Kampagnen-Pageview → Adresse kopiert“ je Event lässt sich daraus
nicht bauen.

## What Changes

- **Neues PostHog-Event `event_server_address_copied`**, gesendet über das
  bestehende `useAnalytics().trackEvent`, wenn ein Besucher im Block „So
  nimmst du teil“ einer Event-Detailseite die Serveradresse **erfolgreich**
  in die Zwischenablage kopiert hat.
- **Properties**: `event_slug`, `event_key` (`translationKey`), `locale`,
  `event_phase`.
- **Kein Event**, wenn die Clipboard-API fehlt oder das Schreiben fehlschlägt.
- **Einwilligung und Host-Sperre** gelten unverändert: `trackEvent` geht über
  denselben PostHog-Client, den die Consent-Schicht stummschaltet und den das
  Produktions-Gate außerhalb von onelitefeather.net abschaltet.
- Der Autocapture-Klick bleibt bestehen.

Nicht in diesem Change: der Kopier-Button der Startseite
(`layers/home/components/ServerAddresses.vue`), Discord- oder
Anmelde-Buttons, PostHog-Dashboards und -Funnels (werden in PostHog
angelegt, nicht im Code).

Unabhängig von `slender-night`; wird vorher ausgeliefert, damit die Messung
vor der ersten Slender-Nacht (31. Oktober 2026) läuft.

## Capabilities

### New Capabilities

_Keine._

### Modified Capabilities

- `events`: Das erfolgreiche Kopieren der Serveradresse auf der
  Detailseite wird als Konversion erfasst.

## Impact

- `layers/events/components/EventJoinBlock.vue` (emittiert `address-copied`)
- `layers/events/utils/eventConversions.ts` (neu, rein)
- `layers/events/composables/useEventConversions.ts` (neu),
  `layers/events/index.ts` (Export)
- `pages/events/[...slug].vue` (Verdrahtung)
- Tests unter `tests/events/`
- Keine neuen Abhängigkeiten, keine Inhalts- oder Schemaänderung, keine
  i18n-Schlüssel.
