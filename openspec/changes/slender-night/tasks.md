# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `feat(events): …`, Tests im selben Commit wie der Code,
den sie treiben. Tests nach F.I.R.S.T.: Zeit wird injiziert (fester
`now`-Parameter oder `tests/helpers/manualClock.ts`), nie `Date.now()`,
`vi.useFakeTimers`/`setSystemTime` oder Wartezeiten; ein Verhalten pro Test,
benannt nach dem Verhalten. Kommentare nur für das nicht offensichtliche
Warum, ein bis zwei Zeilen.

Modell-Empfehlung je Aufgabe: **[Haiku]** mechanisch und klar umrissen,
**[Sonnet]** knifflig (Zonenrechnung, Hydration).

Abhängigkeiten: 1 → 2 → 3; 4 braucht 2; 5.1/5.2 brauchen 3 und 4; 5.3
(Inhalt) braucht nur 1 und kann früh laufen; 6 zuletzt. Das Tracking ist ein
eigener Change (`track-event-address-copies`) und wird vorher gemergt;
vor dem PR auf `main` rebasen.

## 1. Schema und Inhaltsprüfung

- [x] 1.1 **[Haiku]** In `tests/content/events-frontmatter.spec.ts` Fixture-Fälle für `eventFrontmatterProblems` ergänzen, je einer pro Regel: gültiges `sessions` (akzeptiert), `sessions.first` ohne Offset, `first` vor `event.startsAt`, `first` nicht vor `event.endsAt`, fehlendes `label`, `repeat: daily`, `durationMinutes: 0` und `1.5` (je abgelehnt, Meldung nennt das Feld); rot sehen mit `pnpm exec vitest run tests/content/events-frontmatter.spec.ts`
- [x] 1.2 **[Haiku]** Regeln aus 1.1 in `eventFrontmatterProblems` umsetzen (bestehende Helfer `timestamp`, `oneOf`, `before` wiederverwenden) und in `content.config.ts` `eventsSchema` um `sessions: z.object({ label: z.string(), first: eventTimestamp, durationMinutes: z.number().int().positive(), repeat: z.enum(['weekly']).optional() }).optional()` erweitern; verifiziert durch grüne Tests aus 1.1 und `pnpm exec vitest run tests/content`
- [x] 1.3 **[Haiku]** In `layers/events/types.ts` `export type EventSessions = NonNullable<EventDocument['sessions']>` und `export interface EventSessionSlot { startsAt: string, endsAt: string }` ergänzen; verifiziert durch `pnpm typecheck` ohne neue Fehler

## 2. Terminregel (rein)

- [x] 2.1 **[Haiku]** `tests/events/event-sessions.spec.ts` (Node-Environment) für `nextSessionAt(sessions, until, now)` anlegen, ein Verhalten pro Test, mit festem `now`: vor dem ersten Termin; genau bei Beginn läuft er; genau bei Ende ist er vorbei; ohne `repeat` nach dem Ende `null`; laufender Termin wird geliefert; rot sehen
- [x] 2.2 **[Haiku]** `layers/events/utils/eventSessions.ts` mit `nextSessionAt` für den Fall ohne `repeat` umsetzen (kein `Date.now()`, kein Vue); unparsbares `first` → `null`; verifiziert durch grüne Tests aus 2.1
- [x] 2.3 **[Sonnet]** Wöchentliche Wiederholung in Berliner Wandzeit (design.md D2): Tests ergänzen für `2026-11-01T12:00+01:00` → `2026-11-07T21:00+01:00`, für `2027-03-29T12:00+02:00` → `2027-04-03T19:00:00Z` (über die Zeitumstellung), für einen Zeitpunkt viele Wochen nach `first` (kein lineares Durchzählen ab `first`), für die Begrenzung durch `until` (Termin bei genau `until` existiert nicht); dann umsetzen über einen internen Helfer `berlinWallTimeToInstant` auf Basis von `Intl.DateTimeFormat#formatToParts`, ohne neue Abhängigkeit; verifiziert durch `pnpm exec vitest run tests/events/event-sessions.spec.ts`
- [x] 2.4 **[Haiku]** `countdownParts(ms)` → `{ days, hours, minutes }` in derselben Datei, Minuten aufgerundet; Tests: 26 h 30 min → 1/2/30, 59 s → 0/0/1, 0 und negativ → 0/0/0; verifiziert durch grüne Tests

## 3. Server legt den Termin fest

- [x] 3.1 **[Haiku]** In `tests/events/event-detail.spec.ts` (nuxt-Environment, bestehendes Muster mit `mockNuxtImport('useContentRepository', …)`) einen Fall ergänzen: ein Event mit `sessions` und einer Regel, deren Termin für jedes plausible `now` in der Zukunft liegt (`first` im Jahr 2099, `startsAt`/`announceAt` in der Vergangenheit, kein `endsAt`) liefert `detail.nextSession.startsAt === '2099-…'`; ein Event ohne `sessions` liefert `nextSession: null`; rot sehen. (Kein `setSystemTime`: die Daten sind so gewählt, dass das Ergebnis nicht von der Systemzeit abhängt.)
- [x] 3.2 **[Haiku]** `EventDetail` in `layers/events/composables/useEvents.ts` um `nextSession: EventSessionSlot | null` erweitern und im `useAsyncData`-Handler mit dem dort bestimmten `now` berechnen, nur für Phase `announced`/`running`; verifiziert durch grüne Tests aus 3.1 und unverändert grünes `tests/events/phase-on-server.spec.ts`

## 4. Browser-Uhr

- [x] 4.1 **[Haiku]** `tests/helpers/manualClock.ts`: `manualClock(startMs)` implementiert `ClientClock`, `advance(ms)` erhöht `now` und ruft registrierte Ticks synchron auf, `activeTimers()` zählt laufende Ticks (für den Unmount-Test)
- [x] 4.2 **[Sonnet]** `tests/base/use-client-now.spec.ts` (happy-dom): `renderToString` liefert den Wert `null`; nach `mount` mit `global.provide` der manuellen Uhr hat er deren `now`; nach `advance(1000)` den neuen Wert; nach `unmount` ist kein Tick mehr aktiv — je ein Test. Dann `layers/base/utils/clientClock.ts` (`ClientClock`, `CLIENT_CLOCK_KEY`, `systemClock`) und `layers/base/composables/useClientNow.ts` nach design.md D4 umsetzen, nur `vue`-Imports; verifiziert durch grüne Tests
- [x] 4.3 **[Sonnet]** `layers/events/components/EventNextSession.vue` (Props: `sessions`, `until?`, `initial: EventSessionSlot`) nach design.md D3/D5: vor dem Mount nur `initial` als `DateRange` plus Wiederholungshinweis; nach dem Mount `nextSessionAt` mit `useClientNow()`, Countdown in `role="timer"` oder `M3Chip` „Läuft gerade“, Abschnitt verschwindet bei `null`. Nur MD3-Rollen und M3-Primitive. Tests in `tests/events/event-next-session.spec.ts` (happy-dom, manuelle Uhr per `global.provide`), je einer: SSR-String enthält Label und `<time datetime>` und keinen `role="timer"`; nach Mount 26 h 30 min vor Beginn steht „1 Tag, 2 Stunden“; bei laufendem Termin „Läuft gerade“; mit veraltetem `initial` springt der Zeitpunkt auf die nächste Woche; nach `advance` über den Beginn wechselt Countdown zu „Läuft gerade“; ohne verbleibenden Termin ist der Abschnitt leer
- [x] 4.4 **[Sonnet]** Hydrations-Test in derselben Datei: `createSSRApp` + `renderToString`, HTML in einen Container, zweites `createSSRApp(...).mount(container)` mit `app.config.warnHandler`-Spy und manueller Uhr, deren `now` vom Render-Zeitpunkt abweicht; erwartet keine Warnung mit „Hydration“; verifiziert durch grünen Test und einen kurzen Gegenversuch (Countdown testweise vor dem Mount rendern → Test wird rot, danach zurück)

## 5. Seite, Texte und Inhalt

- [x] 5.1 **[Haiku]** i18n-Schlüssel in `i18n/locales/de.json` und `en.json`: `events.sessions.weekly` („Jede Woche zur selben Zeit“ / „Every week at the same time“), `events.sessions.starts_in` („beginnt in {time}“ / „starts in {time}“), `events.sessions.live` („Läuft gerade“ / „Happening now“), `events.sessions.unit.days|hours|minutes` mit Pluralformen („{n} Tag | {n} Tage“ / „{n} day | {n} days“ usw.); verifiziert durch `pnpm exec vitest run tests/i18n`
- [x] 5.2 **[Haiku]** `pages/events/[...slug].vue`: `<EventNextSession>` direkt vor `EventJoinBlock` einbinden, nur wenn `event.sessions && detail.nextSession && phase !== 'past'`; verifiziert durch `pnpm exec vitest run tests/architecture tests/design-system` (insb. `request-independent-render`, `md3-governance`, `layer-name-collisions`)
- [x] 5.3 **[Haiku]** `content/events/de/slender.md` und `en/slender.md` nach design.md D6: `title` „Slender: Zurück in den Nebel“ / „Slender: Back into the fog“; in `summary` „die überarbeitete Halloween-Variante“ → „die überarbeitete Fassung“ bzw. „the reworked Halloween edition“ → „the reworked edition“; `event.endsAt: 2026-12-31T23:59:00+01:00`; `sessions` mit `label: Slender-Nacht` / `Slender night`, `first: 2026-10-31T21:00:00+01:00`, `durationMinutes: 180`, `repeat: weekly`. Slug, `translationKey`, Text, Bild-`alt`/`caption`, `requirements` und `modeSummary` unverändert lassen; keine Spielwerte. Danach `grep -i halloween content/events` → kein Treffer; verifiziert durch `pnpm exec vitest run tests/content`
- [x] 5.4 **[Haiku]** Sichtprüfung: `NODE_ENV=production pnpm build && pnpm preview:prod`, `/de/events/slender` und `/en/events/slender` mit `curl` (HTML enthält Label und `<time datetime="2026-10-31T20:00:00.000Z">`, keinen Countdown) und im Browser (Countdown erscheint, keine Hydration-Warnung in der Konsole, neuer Titel, Light/Dark, `?season=halloween` und `?season=winter`); Screenshot für den PR

## 6. Abschluss

- [x] 6.1 **[Haiku]** `pnpm test`, `pnpm quality` (keine Zahl steigt gegenüber `quality-baseline.json`), `pnpm typecheck` und `pnpm build` laufen grün; `.nuxtrc`-Änderungen aus dem nuxt-Environment nicht committen
- [x] 6.2 **[Haiku]** Pull Request gegen `main` mit dem Titel `feat(events): announce the weekly slender night with a countdown` öffnen (englische Beschreibung: Zusammenfassung, Begründung, Screenshots DE/EN aus 5.4, Hinweis auf das neue `endsAt` 31. Dezember, den neuen Titel, die Nebenwirkungen aus design.md D7 und die offenen Fragen)
