# Proposal: Session-Recorder erst nach Interaktion oder echtem Leerlauf laden

Ausgeliefert als `perf(analytics)`. Pull-Request-Titel:
`perf(analytics): load the session recorder only after interaction or idle`

## Why

Lighthouse (12.8.2, Mobile) meldet für `/ingest/ph/static/<ver>/posthog-recorder.js`
72 KB übertragen, davon 38 KB ungenutzt. Das Skript wird schon während des
Seitenaufbaus geladen, obwohl `layers/base/plugins/posthog-recording.client.ts`
es nach dem ersten Paint nachladen soll.

Ursache (aus dem Quelltext von posthog-js 1.438.9 gelesen, noch nicht im
Browser belegt — siehe Task 1.1):

- `disable_session_recording: true` in `nuxt.config.ts` verhindert den Start
  bei `posthog.init` korrekt. Das Plugin ruft danach
  `startSessionRecording()` auf; das setzt die Option per `set_config` auf
  `false` und lädt das Skript sofort.
- Das Plugin ruft `deferUntilIdle` auf, mit `requestIdleCallback` und 4 s
  Timeout. „Idle“ heißt hier nur: der Main-Thread hat gerade nichts zu tun.
  Das passiert kurz nach der Hydration, mitten im Lighthouse-Ladefenster
  (das erst nach Netzwerk- und CPU-Ruhe endet). Der Recorder gehört damit zur
  Ladephase, obwohl er für die Darstellung nichts beiträgt.
- Auch bei später Auslösung braucht PostHog zuerst die Remote-Config
  (`/array/<key>/config(.js)` über `/ingest`), weil sie Aktivierung und
  Skriptnamen des Recorders enthält. Diese Anfrage bleibt.

## What Changes

- Neue reine Auslöse-Logik in `layers/base/utils/` (Scheduler und
  Event-Quelle injiziert): der Recorder startet beim **ersten** von
  (a) echter Nutzer-Interaktion (`pointerdown`, `keydown`, `touchstart`,
  `scroll`, `wheel`) oder (b) echtem Leerlauf — erst `IDLE_AFTER_LOAD_MS`
  nach dem `load`-Event, dann `requestIdleCallback`. Einmalig, danach sind
  alle Listener entfernt.
- `posthog-recording.client.ts` verwendet diese Logik statt
  `deferUntilIdle`; Einwilligung und Produktions-Host-Sperre bleiben
  unverändert maßgeblich (Opt-out wird vor dem Start geprüft).
- Optional, je mit Wirkung im Design aufgelistet: weniger `/ingest`-Anfragen
  über die PostHog-Konfiguration.

## Capabilities

### New Capabilities

- `session-recording`: wann der Recorder geladen wird und dass die
  Einwilligung dabei maßgeblich bleibt.

### Modified Capabilities

- Keine. Die Einwilligungs-Spec (`cookie-consent`) bleibt unverändert; die
  neue Spec verlangt nur, dass sie weiter gilt.

## Impact

- `layers/base/plugins/posthog-recording.client.ts`,
  `layers/base/utils/` (neue Auslöse-Funktion), ggf. `nuxt.config.ts`
  (`posthog.clientOptions`)
- `tests/base/` (neue Specs), `tests/analytics/posthog-config.spec.ts`
- Betrifft nur Produktion (Analytics erfasst nur dort, siehe `dfce43e`).
- Sitzungen von Besuchern, die nie interagieren und die Seite vor Ablauf der
  Leerlauf-Frist verlassen, werden nicht mehr aufgezeichnet — gewollt.
- Keine neuen Abhängigkeiten.
