# Design: Kopieren der Serveradresse als Konversion erfassen

## Context

- `EventJoinBlock` (`layers/events`) zeigt bei `access.mode: open` und
  `join.server: true` die Java-Serveradresse und einen `CopyButton`.
  `copyAddress` ruft `navigator.clipboard.writeText` und setzt `copied` —
  ohne Fehlerbehandlung. Der `CopyButton` trägt nur Autocapture-Attribute.
- `useAnalytics().trackEvent(name, props)` (`layers/base`) ruft
  `$clientPosthog.capture` und schweigt ohne Client oder bei Fehlern.
- Die Consent-Schicht (`layers/consent`) schaltet PostHog per
  `opt_out_capturing()` / `opt_in_capturing()`;
  `posthog-production-gate.client.ts` schaltet Capture außerhalb des
  Produktions-Hosts ab. Statistik läuft standardmäßig, Besucher können
  widersprechen.
- Die bestehenden `EventJoinBlock`-Tests (`tests/events/event-components.spec.ts`)
  laufen in happy-dom mit einfachem `mount`, ohne Nuxt-Laufzeit; ein
  `useNuxtApp()` in der Komponente würde sie brechen.
- Die Seite `pages/events/[...slug].vue` kennt Event, Phase und Sprache; ein
  voller Seiten-Mount in Vitest scheitert an `defineOgImage` (siehe Archiv
  `add-unlisted-events`, Aufgabe 4.3).

## Decisions

### D1 – Name und Properties

`event_server_address_copied`: snake_case wie das bestehende `share_event`,
Objekt plus Vergangenheitsform, damit es in PostHog als Konversion lesbar
ist.

| Property | Wert | Zweck |
|---|---|---|
| `event_slug` | Slug der Seite, z. B. `slender` | Event auf einen Blick |
| `event_key` | `translationKey`, z. B. `event-slender-2026` | Auswertung über beide Sprachen |
| `locale` | `de` \| `en` | Sprachvergleich |
| `event_phase` | vom Server bestimmte Phase, z. B. `running` | Konversion vor/während des Events |

UTM-Parameter hängt PostHog selbst an Pageview und Session; der Funnel
„Pageview mit `utm_campaign=halloween-2026` → `event_server_address_copied`“
entsteht in PostHog. Die Seite liest die Query nie
(`request-independent-render.spec.ts`).

### D2 – Erst nach erfolgreichem Schreiben

`copyAddress` wird zu `try { await writeText(...); copied = true; emit('address-copied') } catch {}`.
Fehlende Clipboard-API oder eine abgelehnte Zusage senden nichts und lassen
den Button unverändert. Eine Konversion, die keine war, verfälscht den
Funnel.

### D3 – Komponente emittiert, Composable trackt, Seite verdrahtet

- `EventJoinBlock` bleibt ohne Analytics-Abhängigkeit und emittiert
  `address-copied` — weiter in happy-dom testbar.
- `serverAddressCopiedEvent(event, locale, phase)` in
  `layers/events/utils/eventConversions.ts` baut `{ name, properties }`, rein
  und im Node-Environment testbar.
- `useEventConversions()` in `layers/events/composables/` liefert
  `trackServerAddressCopied(detail, locale)` und ruft `trackEvent`; getestet
  im `nuxt`-Environment mit `mockNuxtImport('useAnalytics', …)`.
- Die Seite bindet `@address-copied` an diese Funktion — eine Zeile, weil
  sie Phase und Sprache ohnehin hat.

Verworfen: `useAnalytics` direkt in `EventJoinBlock` (bricht die
happy-dom-Tests oder zwingt sie ins teure `nuxt`-Environment); Tracking in
`CopyButton` (`layers/base` kennt keine Events, und der Button weiß nicht,
ob das Schreiben gelang).

### D4 – Keine eigene Consent-Prüfung

Eine zweite Prüfung wäre eine zweite Wahrheit neben der Consent-Schicht und
könnte auseinanderlaufen. Die Garantie hängt an PostHogs Opt-out und dem
Produktions-Gate; beide sind durch `tests/consent/` und `tests/analytics/`
abgedeckt.

## Risks / Trade-offs

- **Doppelte Zählung mit Autocapture** → zwei verschiedene Events
  (`$autocapture` und `event_server_address_copied`); Auswertungen nehmen
  das neue.
- **Verdrahtung der Seite ohne Mount-Test** → Quelltext-Prüfung wie
  `tests/seo/event-noindex.spec.ts` plus manuelle Prüfung.
