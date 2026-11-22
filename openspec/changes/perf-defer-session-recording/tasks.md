# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T.: kein echtes Warten, keine
Browser-API — Scheduler, Event-Quelle und Start-Funktion werden injiziert
(Fake-Timer), jeder Test baut sein Fixture neu. Builds und Testläufe über
`heavy`, z. B. `heavy pnpm exec vitest run <pfad>`. Branch von aktuellem
`origin/main`, der diesen Vorschlag schon enthält.

## 1. Befund bestätigen

- [ ] 1.1 [Haiku] Produktions-Build (`NODE_ENV=production heavy pnpm build`, `pnpm preview:prod`) oder die Produktion: Lighthouse 12.8.2 Mobile, Netzwerk-Log sichern; bestätigen, wann und wodurch `posthog-recorder.js` angefragt wird und welche `/ingest`-Anfragen je Seitenaufruf auftreten (`/array/…/config`, `/flags`, `/e/`, `/s/`, Skripte). Ergebnis ist das „Vorher“ für die PR-Beschreibung

## 2. Auslöse-Logik

- [ ] 2.1 [Haiku] `tests/base/recording-trigger.spec.ts` mit Fake-Ports: kein Start beim Scharfschalten; erster Interaktionstyp startet genau einmal und baut Listener und Timer ab; Leerlauf-Zweig startet erst nach der Frist und dann im Idle-Callback; ein zweiter Auslöser startet nicht erneut; `dispose` vor dem Auslöser verhindert den Start. Rot sehen
- [ ] 2.2 [Haiku] `layers/base/utils/recordingTrigger.ts` (`armRecordingTrigger`, `IDLE_AFTER_LOAD_MS`) bis zu grünen Tests aus 2.1
- [ ] 2.3 [Haiku] `posthog-recording.client.ts` verdrahtet `window` und startet nur bei `!has_opted_out_capturing()`; Test dafür mit Fake-Client (abgelehnt → kein `startSessionRecording`). Wird `deferUntilIdle` danach nirgends mehr genutzt, samt Test entfernen
- [ ] 2.4 [Haiku] `tests/analytics/posthog-config.spec.ts` bleibt grün (`disable_session_recording: true`); Kommentar in `nuxt.config.ts` auf den neuen Auslöser anpassen

## 3. /ingest-Reduktionen (nur, was 1.1 bestätigt)

- [ ] 3.1 [Haiku] Je bestätigte Maßnahme aus der Tabelle im Design einzeln, mit Config-Test nach dem Muster in `tests/analytics/posthog-config.spec.ts`. `advanced_disable_flags` nur nach Klärung der offenen Frage 1

## 4. Abschluss

- [ ] 4.1 [Haiku] `heavy pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht); `.nuxtrc`-Änderungen nicht committen
- [ ] 4.2 [Haiku] „Nachher“: Produktions-Build, Lighthouse 12.8.2 Mobile erneut; das Netzwerk-Log zeigt `posthog-recorder.js` nicht mehr im Ladefenster. Danach im Browser: Interaktion löst den Recorder aus, Ablehnen verhindert ihn
- [ ] 4.3 [Haiku] Commits nur vom Typ `perf(analytics)`
- [ ] 4.4 [Haiku] Pull Request gegen `main` mit dem Titel `perf(analytics): load the session recorder only after interaction or idle` öffnen, ohne Dateien unter `openspec/`. Beschreibung auf Englisch als kurze Domain-Story (keine PR-Vorlage im Repo): Problem (Recorder im Ladefenster), Lösung, Vorher/Nachher-Messung. Keine Session-Links oder Trailer
