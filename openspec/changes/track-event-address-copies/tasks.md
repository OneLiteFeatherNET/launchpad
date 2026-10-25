# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `feat(events): …`, Tests im selben Commit wie der Code,
den sie treiben. Tests nach F.I.R.S.T.: keine Wartezeiten, keine
Systemzeit, `navigator.clipboard` pro Test frisch gestubbt und danach
wiederhergestellt, ein Verhalten pro Test. Kommentare nur für das nicht
offensichtliche Warum, ein bis zwei Zeilen.

Alle Aufgaben sind **[Haiku]**-tauglich. Keine Abhängigkeit zu
`slender-night`.

## 1. Komponente

- [x] 1.1 In `tests/events/event-components.spec.ts` (happy-dom) drei Tests für `EventJoinBlock` ergänzen: emittiert `address-copied` genau einmal, wenn `writeText` erfüllt; emittiert nichts und zeigt nicht „Kopiert“, wenn `writeText` ablehnt; emittiert nichts ohne `navigator.clipboard`; rot sehen mit `pnpm exec vitest run tests/events/event-components.spec.ts`
- [x] 1.2 `copyAddress` in `layers/events/components/EventJoinBlock.vue` nach design.md D2 umbauen, `defineEmits<{ 'address-copied': [] }>()`; verifiziert durch grüne Tests aus 1.1 und die bestehenden `EventJoinBlock`-Tests

## 2. Event-Daten

- [x] 2.1 `tests/events/event-conversions.spec.ts` (Node): `serverAddressCopiedEvent({ slug, translationKey }, locale, phase)` liefert Name `event_server_address_copied` und die vier Properties; ohne `translationKey` ist `event_key` der Slug; rot sehen
- [x] 2.2 `layers/events/utils/eventConversions.ts` umsetzen; verifiziert durch grüne Tests aus 2.1

## 3. Tracking

- [x] 3.1 `tests/events/use-event-conversions.spec.ts` (`// @vitest-environment nuxt`, `mockNuxtImport('useAnalytics', …)` mit Spy auf `trackEvent`): `trackServerAddressCopied(detail, 'de')` ruft `trackEvent` genau einmal mit Name und Properties; rot sehen
- [x] 3.2 `layers/events/composables/useEventConversions.ts` umsetzen und in `layers/events/index.ts` exportieren; verifiziert durch grünen Test aus 3.1 und `pnpm exec vitest run tests/architecture` (`module-boundaries`, `layer-name-collisions`)

## 4. Seite

- [x] 4.1 Quelltext-Test `tests/events/event-page-conversion.spec.ts` (Muster `tests/seo/event-noindex.spec.ts`): `pages/events/[...slug].vue` bindet `@address-copied` an `trackServerAddressCopied`; rot sehen, dann in der Seite verdrahten; grün
- [x] 4.2 Manuell in `NODE_ENV=production pnpm build && pnpm preview:prod`: Klick auf „Adresse kopieren“ auf `/de/events/slender` und `/en/events/slender` erreicht `trackEvent` (Breakpoint oder temporäres `console.debug`, nicht committen); außerhalb des Produktions-Hosts geht keine Anfrage an PostHog

## 5. Abschluss

- [x] 5.1 `pnpm test`, `pnpm quality` (keine Zahl steigt), `pnpm typecheck`, `pnpm build` grün; `.nuxtrc`-Änderungen nicht committen
- [ ] 5.2 Pull Request gegen `main` mit dem Titel `feat(events): track server address copies as a posthog conversion` öffnen (englische Beschreibung: Eventname, Properties, Einwilligungsverhalten, Hinweis für das Marketing auf den PostHog-Funnel mit `utm_campaign=halloween-2026`)
