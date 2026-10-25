# Proposal: Wöchentliche Slender-Nacht mit Countdown

Ausgeliefert als `feat(events)`. PR-Titel:
`feat(events): announce the weekly slender night with a countdown`

Wird nach `track-event-address-copies` ausgeliefert, hängt aber nicht davon
ab. Beide ändern `pages/events/[...slug].vue`; der spätere PR wird auf den
früheren rebased.

## Why

Der Slender-Modus (nur Minecraft Java 26.2) läuft seit dem 24. Oktober 2026,
aber mit wenigen Spielern: Wer die Seite öffnet, weiß nicht, *wann* sich ein
Besuch lohnt. Das Marketing setzt deshalb einen festen Termin, die
„Slender-Nacht“: jeden Samstag um 21:00 Uhr Berliner Zeit, erstmals am
31. Oktober 2026 (`2026-10-31T21:00:00+01:00`, die Sommerzeit endete am
25. Oktober), bis zum Jahresende. Das Event läuft dafür über Halloween
hinaus bis zum 31. Dezember 2026 und verliert den Halloween-Titel.

## What Changes

- **Neues optionales Frontmatter-Objekt `sessions`** für Events: ein
  Bezeichner (`label`), der erste Termin (`first`, mit Offset), eine Dauer
  (`durationMinutes`) und optional `repeat: weekly`. Termine enden spätestens
  mit `event.endsAt`. Die Wiederholung gilt in Berliner Ortszeit, also über
  Zeitumstellungen hinweg immer zur selben Uhrzeit.
- **Die Detailseite zeigt den nächsten Termin** in einem eigenen Block über
  „So nimmst du teil“: im Server-Render als absoluten Zeitpunkt
  (`<time datetime>`, Europe/Berlin), nach dem Mount im Browser zusätzlich
  als Countdown („beginnt in 6 Tagen, 3 Stunden“) oder als Hinweis „läuft
  gerade“. Der Server legt den nächsten Termin fest und gibt ihn im Payload
  mit; Server-HTML und erster Client-Render sind identisch.
- **Weiter ohne Deploy:** Der Browser berechnet nach dem Mount aus der Regel
  selbst den nächsten Termin. Eine bis zu ~70 Minuten alte Seite aus dem
  Edge-Cache zeigt deshalb nie einen vergangenen Termin, und jeden Samstag
  rückt der Termin ohne Deploy vor — bis zum letzten am 26. Dezember 2026.
- **Slender-Inhalt** (`content/events/{de,en}/slender.md`):
  - `sessions` mit `first: 2026-10-31T21:00:00+01:00`,
    `durationMinutes: 180`, `repeat: weekly`;
  - `event.endsAt` von `2026-11-02T23:59:00+01:00` auf
    `2026-12-31T23:59:00+01:00`;
  - neutraler Titel: „Slender: Zurück in den Nebel“ /
    „Slender: Back into the fog“;
  - Zusammenfassung ohne „Halloween“.
  Slug `slender` und `translationKey: event-slender-2026` bleiben.
- **Inhaltsprüfung:** `tests/content/events-frontmatter.spec.ts` prüft
  `sessions` (Offset, `first` innerhalb von `startsAt`…`endsAt`, gültiges
  `repeat`, positive ganzzahlige Dauer, Label vorhanden).
- **i18n:** neue Schlüssel unter `events.sessions.*` in `de.json` und
  `en.json`.

Nicht in diesem Change: Blog, neue Abhängigkeiten, Balancing-Zahlen, der
Termin auf Übersichtskarten oder im Startseiten-Carousel, ein Kalender-Export
(`.ics`), Tracking (eigener Change `track-event-address-copies`), der
Kopier-Button der Startseite.

## Capabilities

### New Capabilities

_Keine._

### Modified Capabilities

- `events`: Events können wiederkehrende Termine tragen, und die
  Detailseite zeigt den nächsten Termin mit Countdown.

## Impact

- `content.config.ts` (`eventsSchema.sessions`),
  `tests/content/events-frontmatter.spec.ts`
- `layers/events/utils/eventSessions.ts` (neu, rein), `types.ts`
  (`EventSessions`, `EventSessionSlot`), `composables/useEvents.ts`
  (`EventDetail.nextSession`)
- `layers/events/components/EventNextSession.vue` (neu)
- `layers/base/composables/useClientNow.ts`, `layers/base/utils/clientClock.ts`
  (neu, Uhr-Port für den Browser)
- `pages/events/[...slug].vue` (Block einbinden)
- `content/events/{de,en}/slender.md`
- `i18n/locales/{de,en}.json`
- Nebenwirkungen des neuen `endsAt` (Carousel, Navigation, Sitemap,
  Schema.org): siehe design.md D7.
- Keine neuen Abhängigkeiten, keine Migration; Events ohne `sessions`
  bleiben unverändert. Das neue Feld wird eine JSON-Spalte in D1.
