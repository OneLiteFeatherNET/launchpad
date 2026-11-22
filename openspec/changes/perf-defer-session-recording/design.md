# Design: Session-Recorder erst nach Interaktion oder echtem Leerlauf laden

## Context

Gelesen an `origin/main` `83fc3fe`, posthog-js 1.438.9, nuxt-posthog 1.6.3.

- `nuxt-posthog` ruft `posthog.init` mit `clientOptions` aus
  `nuxt.config.ts:281-291` auf; mit `proxy: true` geht alles über
  `/ingest/ph/**` (API) und `/ingest/ph/static/**` (Assets) per Nitro-Proxy.
  `/ingest/**` ist `no-store`; jede Anfrage ist eine Worker-Invocation.
- `SessionRecording._isRecordingEnabled` verlangt Remote-Config
  `enabled`, `!disable_session_recording` und nicht opted-out.
  `_lazyLoadAndStart` lädt dann `scriptConfig.script || 'lazy-recorder'`
  per `loadExternalDependency` von `/static/`.
- `posthog.startSessionRecording()` setzt `disable_session_recording: false`
  (`set_config` → `startIfEnabledOrStop`) und lädt den Recorder sofort.
- `deferUntilIdle` (`layers/base/utils/deferUntilIdle.ts`) nutzt
  `requestIdleCallback({ timeout: 4000 })`, sonst `setTimeout(2000)`.
- Einwilligung: `consentController` ruft `opt_in/opt_out_capturing`;
  außerhalb der Produktions-Domain sperrt `posthog-production-gate`.
  Der SDK-eigene Check `consent.isOptedOut()` verhindert den Recorder-Start.
- `blog-ethanol-conversion` wird in `ArticleCard.vue` als Feature-Flag
  gelesen: der `/flags`-Aufruf ist also in Gebrauch.

## Goals / Non-Goals

**Goals:** Der Recorder wird in einem Mobile-Lighthouse-Lauf der
Produktion nicht angefragt; echte Besucher, die lesen oder interagieren,
werden weiter aufgezeichnet; Einwilligung bleibt maßgeblich.

**Non-Goals:** Recorder-Konfiguration (Maskierung, Sampling) ändern;
PostHog-Projekteinstellungen im Dashboard anfassen; Events oder Pageviews
verzögern.

## Decisions

1. **Auslöser: erste Interaktion ODER Leerlauf nach `load`.** Ein reines
   `requestIdleCallback` reicht nicht (Ursache oben). Interaktion ist das
   ehrlichste Signal für „diese Sitzung ist echt“; der Leerlauf-Zweig fängt
   Leser ab, die nur lesen. Der Leerlauf-Zweig wartet `IDLE_AFTER_LOAD_MS`
   (Vorschlag 10 000) nach `load` und fragt dann
   `requestIdleCallback({ timeout })`. Alternativen: nur Interaktion (verliert
   passive Leser, verzerrt Replays), `setTimeout` allein (kein Leerlauf).
2. **Reine Funktion mit Ports.** `armRecordingTrigger({ target, schedule,
   idle, start })` bekommt Event-Quelle, Timer, Idle-Scheduler und die
   Start-Funktion injiziert und gibt eine `dispose`-Funktion zurück. Test
   ohne Browser und ohne echte Timer, wie `deferUntilIdle`. Das Plugin
   verdrahtet nur `window`, `setTimeout`, `requestIdleCallback` und
   `$clientPosthog.startSessionRecording`. `deferUntilIdle` bleibt, wenn
   noch genutzt, sonst entfällt es samt Test (Task 2.3).
3. **Einmalig und aufräumend.** Der erste Auslöser startet, entfernt alle
   Listener und bricht Timer ab. Start höchstens einmal.
4. **Einwilligung bleibt vorn.** Der Start-Callback prüft
   `has_opted_out_capturing()` und startet nicht, wenn die Besucherin
   abgelehnt hat oder der Host nicht die Produktion ist; zusätzlich greift
   der SDK-eigene Check. Entscheidet sich jemand erst nach dem Auslöser für
   Statistik, beginnt die Aufzeichnung beim nächsten Seitenaufruf
   (bewusst nicht nachgerüstet).
5. **`disable_session_recording: true` bleibt** in `nuxt.config.ts`; der
   bestehende Config-Test bleibt gültig.

## Weniger `/ingest`-Anfragen (Bonus, je einzeln entscheidbar)

| Maßnahme | Wirkung | Risiko |
|---|---|---|
| Recorder-Skript später laden (Kern dieses Changes) | 1 Asset-Anfrage (72 KB) weniger im Ladefenster; entfällt ganz für Besucher, die früh gehen | gering |
| `/s/`-Snapshot-Aufrufe entstehen erst mit dem Recorder | folgt aus dem Kern; Kurzbesuche erzeugen keine Replays | gering |
| `capture_dead_clicks: false`, `disable_surveys: true` | bereits gesetzt, vermeiden zwei Skripte | — |
| `advanced_disable_flags: true` | spart `/flags` je Seitenaufruf | bricht `blog-ethanol-conversion` in `ArticleCard`; **nicht** setzen, solange der Flag lebt (Offene Frage 1) |
| Heatmaps/Exception-Autocapture aus | spart Skripte | nur wenn im Projekt aktiviert; Remote-Config prüfen (Task 1.1) |
| `request_queue_config.flush_interval_ms` erhöhen (Standard 3 s) | weniger `/e/`-Batches pro Besuch | Beacon beim Tab-Schließen bleibt; gering bis mittel |
| Remote-Config abschalten | nicht möglich ohne Recorder: sie liefert Aktivierung und Skriptnamen | verworfen |

Umgesetzt wird nur, was Task 1.1 am echten Netzwerkprotokoll als
tatsächlich auftretend bestätigt.

## Risks / Trade-offs

- Replays beginnen später; die ersten Sekunden einer Sitzung fehlen, wenn
  der Auslöser erst bei der ersten Interaktion feuert. Hinnehmbar, da der
  Recorder beim Start einen Vollschnappschuss der Seite nimmt.
- Zu kurze Leerlauf-Frist würde Lighthouse weiter treffen. Die Frist wird
  am Messlauf (Task 4.2) geprüft und gegebenenfalls erhöht.
- Das Verhalten von `startSessionRecording` ist aus dem Quelltext gelesen;
  Task 1.1 bestätigt es im Browser, bevor Code entsteht.

## Open Questions

1. Wird `blog-ethanol-conversion` noch ausgewertet? Wenn nein, entfallen
   `/flags` und der Flag-Code in `ArticleCard.vue` in einem eigenen Change.
2. Sind Heatmaps/Exception-Autocapture im PostHog-Projekt aktiv?
3. Passt eine Leerlauf-Frist von 10 s, oder soll nur Interaktion zählen?
