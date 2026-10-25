# Design: Wöchentliche Slender-Nacht mit Countdown

## Context

Motivation: siehe `proposal.md`. Anforderungen: siehe `specs/events/spec.md`.

Der Bestand, auf dem dieser Change aufsetzt:

- **Das Slender-Event existiert und läuft**: `content/events/{de,en}/slender.md`,
  `startsAt: 2026-10-24T18:00:00+02:00`, `endsAt: 2026-11-02T23:59:00+01:00`,
  `access.mode: open`, `join.server: true`. Die Detailseite
  `pages/events/[...slug].vue` zeigt unten `EventJoinBlock` mit
  Serveradresse und `CopyButton`. Titel heute „Slender: Halloween 2026“,
  `promote: {}` (Carousel-Fenster = Laufzeit des Events).
- **Die Phase entscheidet der Server** (D4 aus `add-events-section`): Uhr
  und Phasenfunktionen dürfen in `layers/events/{components,composables}` und
  `pages/events` nur innerhalb der Argumente von `useAsyncData(...)`
  vorkommen. `tests/events/phase-on-server.spec.ts` prüft das per Quelltext
  (`new Date()`, `Date.now()` und eine Liste von Phasenfunktionen).
- **Die HTML-Seiten liegen im Edge-Cache** (`s-maxage=600`, SWR 3600, also
  bis ~70 Minuten alt), und kein Render darf Query, Cookies oder Header lesen
  (`tests/architecture/request-independent-render.spec.ts`). Kampagnenlinks
  mit `?utm_campaign=halloween-2026` landen also auf derselben gecachten
  Seite; die UTM-Parameter liest allein PostHog im Browser.
- **Zeiten** zeigt `DateRange` (`layers/base`) fest in `Europe/Berlin`, damit
  Server und Browser denselben Text erzeugen.
- **Tracking** des Kopier-Buttons ist ein eigener, vorher ausgelieferter
  Change (`track-event-address-copies`); dieser Change berührt
  `EventJoinBlock` nicht.
- **Saison**: `halloween` gilt vom 20. Oktober bis 2. November und färbt
  alle MD3-Rollen um; neue UI mit Rollen-Tokens wird automatisch mitgefärbt.

## Goals / Non-Goals

**Goals:**
- Ein fester, wiederkehrender Termin ist auf der Slender-Seite sichtbar, mit
  Countdown, ohne Hydration-Mismatch und ohne den Cache zu verletzen.
- Der Termin rückt jede Woche ohne Deploy vor, vom 31. Oktober bis zum
  letzten Samstag vor dem 31. Dezember 2026 (26. Dezember).
- Das Slender-Event ist nach dem 2. November inhaltlich korrekt.
- Lieferbar bis ~30. Oktober 2026 inklusive Release-PR.

**Non-Goals:**
- Termine auf Übersichtskarten, im Carousel oder in der Sitemap.
- Kalender-Export, Erinnerungen, Push.
- Allgemeine Wiederholungsregeln (RRULE, mehrere Wochentage, Ausnahmen).
- Tracking (eigener Change `track-event-address-copies`), auch für den
  Kopier-Button der Startseite (`ServerAddresses.vue`).
- Blogbeiträge zu Slender (Blog ist außerhalb des Scopes).

## Decisions

### D1 – Termine am bestehenden Event, kein neuer Event-Eintrag

Die Slender-Nacht wird als `sessions`-Objekt am bestehenden Event
`slender` gepflegt, nicht als eigener Eintrag `slender-night`.

- Ein Event hat genau einen Zeitraum (`startsAt`…`endsAt`); eine
  wöchentliche Wiederholung lässt sich als Einzel-Event nur durch einen
  Eintrag pro Woche abbilden, also durch einen Deploy pro Woche.
- Ein zweiter Eintrag würde Anleitung, Galerie, FAQ und Teilnahme-Block
  doppeln, Kampagnen-Traffic und Konversionen auf zwei Seiten aufteilen und
  in Übersicht und Carousel zwei Slender-Kacheln zeigen.
- Ein „Termin innerhalb eines laufenden Events“ ist genau, was die
  Slender-Nacht ist: dieselbe Spielweise, derselbe Server, ein verabredeter
  Zeitpunkt mit mehr Mitspielern.

Verworfen: neues Event mit `type: play` und `startsAt` am 31. Oktober
(siehe oben); ein Termin-Abschnitt nur im Markdown-Text (kein Countdown,
nicht maschinenlesbar, keine Wiederholung).

### D2 – `sessions`: ein Termin plus optionale wöchentliche Wiederholung in Berliner Ortszeit

```yaml
sessions:
  label: Slender-Nacht          # en: Slender night
  first: 2026-10-31T21:00:00+01:00
  durationMinutes: 180
  repeat: weekly                # optional; ohne: genau ein Termin
```

- `first` ist ein `eventTimestamp` (String mit Offset, wie alle Zeitpunkte
  im Schema). `durationMinutes` ist nötig, damit „läuft gerade“ von „nächste
  Woche“ unterscheidbar ist; ohne Dauer spränge der Countdown um 21:00:01 auf
  die nächste Woche.
- **Wiederholung in Wandzeit, nicht in Millisekunden**: Termin *k* liegt am
  Kalendertag `first + 7·k` Tage um dieselbe Uhrzeit in `Europe/Berlin`.
  Sieben mal 24 Stunden wären über die Zeitumstellung (28. März 2027) eine
  Stunde daneben. Bis zum Slender-Ende am 31. Dezember 2026 fällt keine
  Umstellung an; die Regel ist trotzdem allgemein korrekt. Die Umrechnung Wandzeit → Instant geht über
  `Intl.DateTimeFormat#formatToParts` (Offset der Zone an einem Zeitpunkt
  bestimmen, abziehen, einmal nachprüfen) — keine neue Abhängigkeit. Die
  Zone ist fest `Europe/Berlin`, wie bei `DateRange` und der Saison.
- **Begrenzt durch `event.endsAt`**: Ein Termin, der bei oder nach `endsAt`
  beginnt, existiert nicht. Damit braucht `sessions` kein eigenes `until`,
  und ein Termin kann nie nach dem Event liegen.
- Die reine Funktion `nextSessionAt(sessions, until, now)` in
  `layers/events/utils/eventSessions.ts` liefert den Termin, der bei `now`
  läuft oder als nächster beginnt (`{ startsAt, endsAt }` als ISO-Strings),
  oder `null`. Ein laufender Termin zählt als „nächster“: Grenze wie bei
  `eventPhaseAt` — bei genau `startsAt` läuft er, bei genau `endsAt` ist er
  vorbei. Kein `Date.now()` in der Funktion.
- Sie liegt im `events`-Layer, nicht in `shared/utils`: Nitro braucht sie
  nicht (die Sitemap kennt keine Termine).

Verworfen: eine Liste expliziter Termine (`sessions: [..]`). Einfacher,
keine Zonenrechnung, aber jede Verlängerung ist eine Inhaltsänderung samt
Release-PR. Bleibt die Rückfallposition, falls D2 nicht rechtzeitig fertig
wird (siehe „Kürzen bei Zeitnot“).

### D3 – Der Server legt den Termin fest, der Browser nur den Countdown

1. Im `useAsyncData`-Handler von `useEventDetail` (wo `now` ohnehin
   bestimmt wird) berechnet der Server `nextSession` — nur für Phase
   `announced` oder `running`, sonst `null` — und gibt ihn in `EventDetail`
   im Payload mit. Das erfüllt D4 und `phase-on-server.spec.ts` ohne
   Ausnahme.
2. **Server-Render und erster Client-Render** zeigen ausschließlich diesen
   Payload-Termin als absoluten Zeitpunkt über `DateRange` (Start und Ende,
   Europe/Berlin, `<time datetime>`), dazu „jede Woche zur selben Zeit“ bei
   `repeat: weekly`. Kein Countdown, kein „läuft gerade“ — beides hinge von
   der Uhr ab und würde beim Hydrieren abweichen.
3. **Nach dem Mount** liefert `useClientNow()` (D4) die Browserzeit. Erst
   dann rechnet die Komponente `nextSessionAt(rule, endsAt, now)` neu und
   zeigt Countdown oder „läuft gerade“. Ist die gecachte Seite älter als der
   Termin, rückt der angezeigte Zeitpunkt jetzt auf den nächsten vor; gibt es
   keinen mehr, verschwindet der Block. Das sind Updates nach der Hydration,
   keine Mismatches.

Damit hält der Cache: Die HTML hängt nur von Pfad und Renderzeit ab, nie
vom Request. Mit einer bis zu 70 Minuten alten Seite stimmt der Countdown
trotzdem, weil er nur aus Regel und Browserzeit entsteht.

Bekannte Grenze: Geht die Uhr des Geräts falsch, geht der Countdown falsch.
Der absolute Zeitpunkt daneben bleibt richtig.

### D4 – `useClientNow` im `base`-Layer, Uhr injizierbar

```ts
// layers/base/utils/clientClock.ts
export interface ClientClock {
  now: () => number
  /** Ruft `tick` alle `ms` auf; die Rückgabe beendet das. */
  every: (ms: number, tick: () => void) => () => void
}
export const CLIENT_CLOCK_KEY: InjectionKey<ClientClock>
export const systemClock: ClientClock   // Date.now + setInterval

// layers/base/composables/useClientNow.ts
export function useClientNow(intervalMs = 1000): Readonly<Ref<number | null>>
```

- `null` beim Server-Render und während der Hydration; erst `onMounted`
  setzt den Wert und startet `every`, `onBeforeUnmount` stoppt ihn.
- Die Uhr kommt per `inject(CLIENT_CLOCK_KEY, systemClock)`. Tests geben
  über `global.provide` eine manuelle Uhr (`tests/helpers/manualClock.ts`)
  mit `advance(ms)`, die registrierte Ticks synchron auslöst — keine
  Fake-Timer, kein `setSystemTime`, keine Wartezeiten.
- Nur `vue`-Imports, kein Nuxt: Die Komponente lässt sich in happy-dom mit
  `renderToString` und echter Hydration prüfen.
- Domänenfrei, darum `layers/base`. Die Uhr wird dort gelesen, nicht im
  `events`-Layer — `phase-on-server.spec.ts` bleibt unverändert grün, und
  die Regel „das Events-Layer liest keine Uhr“ gilt weiter.
- Takt 1 s: Angezeigt werden Minuten, aber der Wechsel auf „läuft gerade“
  soll pünktlich um 21:00 kommen. Die Kosten sind ein `computed` pro Sekunde.

Verworfen: `useNow` aus `@vueuse/core` — vorhanden, aber nicht injizierbar
ohne `vi.useFakeTimers`, und es liefert schon beim ersten Client-Render
einen Wert (Mismatch-Gefahr). `<ClientOnly>` — rendert auf dem Server gar
nichts; die geforderte stabile SSR-Ausgabe fehlte.

### D5 – Darstellung `EventNextSession`

- Eigener Abschnitt direkt über `EventJoinBlock`, nur wenn
  `detail.nextSession` gesetzt ist und die Phase nicht `past` ist:
  `section` mit `rounded-large bg-secondary-container
  text-on-secondary-container p-6` (dieselbe Rolle wie der Live-Hinweis der
  Seite; die Halloween-Saison färbt sie mit). Überschrift `text-title-large`
  = `sessions.label`, Zeitpunkt `text-title-medium` über `DateRange`.
- Countdown in einem Element mit `role="timer"` (implizit `aria-live="off"`,
  Screenreader werden nicht jede Sekunde unterbrochen), `tabular-nums`,
  `text-headline-small`. Die Zeile ist im SSR schon mit Mindesthöhe (`min-h-8`)
  vorhanden, damit das Einblenden nichts verschiebt.
- „Läuft gerade“ als `M3Chip kind="label"`, keine neuen Primitive, keine
  Rohfarben, keine `dark:`-Varianten; `md3-governance.spec.ts` gilt.
- Text des Countdowns: reine Funktion `countdownParts(ms)` →
  `{ days, hours, minutes }` (Minuten aufgerundet, damit „0 Minuten“ nie vor
  dem Start erscheint), formatiert über i18n-Pluralformen
  `events.sessions.unit.{days,hours,minutes}`. Ab einem Tag Tage + Stunden,
  darunter Stunden + Minuten, unter einer Stunde nur Minuten.
- Kein Link auf den Kalender, kein zweiter Kopier-Button: Der Weg auf den
  Server bleibt der Teilnahme-Block direkt darunter.

### D6 – Das Slender-Event läuft bis zum Jahresende

- `event.endsAt` wird in beiden Sprachen `2026-12-31T23:59:00+01:00`. Mit
  `first: 2026-10-31T21:00:00+01:00`, `durationMinutes: 180` und
  `repeat: weekly` ergeben sich neun Slender-Nächte (21:00–00:00), die
  letzte am 26. Dezember 2026; der 2. Januar 2027 läge nach `endsAt` und
  entfällt. Ab 1. Januar ist das Event `past`; Termin- und Teilnahme-Block
  verschwinden.
- **Neutraler Titel**: DE „Slender: Zurück in den Nebel“, EN „Slender: Back
  into the fog“. Greift das Bildmotiv (Nebel, schwebende Inseln) und die
  Rückkehr des Modus von 2023 auf, nennt weder Datum noch Saison.
- **Zusammenfassung**: „die überarbeitete Halloween-Variante“ / „the
  reworked Halloween edition“ wird zu „die überarbeitete Fassung“ / „the
  reworked edition“, sonst unverändert.
- **Was nach dem 2. November sonst falsch würde** (geprüft, beide
  Sprachen): im Event nur `title`, `summary` und `event.endsAt`. Text
  (Worum es geht, Bevor du joinst, Anleitung, Seiten, FAQ), `thumbnailAlt`,
  Galerie-`alt`/`caption`, `access.requirements` und `play.modeSummary`
  beschreiben Spielprinzip und Bildmotive ohne Saison- oder Datumsbezug und
  bleiben. Optional ein Satz im Abschnitt „Bevor du joinst“, dass jeden
  Samstag ab 21 Uhr eine Slender-Nacht stattfindet — für Leser ohne
  JavaScript ist der Termin-Block aber schon vollständig.
- **Außerhalb des Events** nennen die Blogbeiträge
  `slender-halloween-2026-ankuendigung` / `slender-halloween-2026-announcement`
  „bis zum 2. November 2026, 23:59 Uhr“. Blog ist außerhalb des Scopes;
  siehe offene Frage.
- Slug `slender` und `translationKey: event-slender-2026` bleiben. Der Key
  ist intern, verknüpft die Sprachfassungen (Sprachwechsel, hreflang,
  Sitemap-Alternates) und ist nirgends sichtbar; das Jahr stimmt weiterhin.

### D7 – Nebenwirkungen von neuem `endsAt` und Titel

| Stelle | Wirkung | Handlung |
|---|---|---|
| Sitemap (`server/api/__sitemap__/events.ts`, `visibleEventSitemapEntries`) | Einträge tragen nur `loc` und Alternates, kein Datum aus `endsAt`; das Event bleibt gelistet wie bisher | keine |
| `translationKey`, hreflang, Sprachwechsel | unverändert, Sprachfassungen bleiben verknüpft | keine |
| Startseiten-Carousel (`promote: {}` → Fenster `startsAt`…`endsAt`) | Slender bleibt bis 31. Dezember im Carousel statt bis 2. November | siehe offene Frage; früher beenden ginge mit `promote.until` |
| Hauptnavigation (`hasLiveListedEventAt`) | „Events“ bleibt bis 31. Dezember in der obersten Ebene | keine |
| Übersicht `/…/events` | Slender bleibt bis 31. Dezember unter *Aktuell* | keine |
| Schema.org `Event.endDate`, `<title>`, OG | neues Ende und neuer Titel; ein Deploy leert den Edge-Cache | keine |
| Saison-Layer | unabhängig: liest keine Events; `halloween` endet am 2. November, `winter` gilt 1.–26. Dezember. Der neutrale Titel passt zu jeder Saison | keine |
| `events-frontmatter.spec.ts` | `startsAt` < `endsAt`, Offsets vorhanden, `first` im Zeitraum | grün erwartet |

## Risks / Trade-offs

- **Zonenrechnung ohne Bibliothek** → reine Funktion mit Tests über die
  Zeitumstellung; Abendtermine liegen nie in der Lücke 02:00–03:00. Für
  Lücke/Überlappung legt die Funktion „frühere Ortszeit-Interpretation“
  fest und dokumentiert es, ohne eigenen Test.
- **Layout-Verschiebung**, wenn der Block nach dem Mount verschwindet (alte
  Cache-Kopie nach dem letzten Termin) → selten, höchstens 70 Minuten nach
  einem Termin, akzeptiert.
- **Neue JSON-Spalte in D1** → `@nuxt/content` legt sie beim Befüllen aus den
  Build-Dumps an; `tests/content/schema-columns.spec.ts` muss grün bleiben.
- **Zeitdruck** → siehe nächster Abschnitt.

## Kürzen bei Zeitnot

Lieferung bis ~30. Oktober inklusive gemergtem Release-PR (main-Merges gehen
erst mit dem release-please-PR live). Die Inhaltsänderung aus D6 (Aufgabe
5.3) ist klein und wird nie gestrichen — ohne sie endet das Event am
2. November. In dieser Reihenfolge streichen:

1. **Wöchentliche Wiederholung** (Aufgabe 2.3): nur `first` ohne `repeat`.
   Der 31. Oktober funktioniert vollständig; jeder weitere Samstag braucht
   dann eine Inhaltsänderung samt Release.
2. **Neuberechnung im Browser** (Teil von 4.3): Der Countdown läuft nur auf
   den Payload-Termin; nach dessen Ende blendet sich der Block aus, bis der
   Cache erneuert ist.
3. **Mehrstufige Pluralformen** (Teil von 5.1): nur „in {time}“ mit
   Stunden/Minuten.

Nie streichen: stabile SSR-Ausgabe mit absolutem Zeitpunkt, der
Hydrations-Test (4.4) und die Inhaltsänderung (5.3).

## Open Questions

1. **Blogbeiträge zur Ankündigung** nennen „bis zum 2. November 2026“. Der
   Blog ist außerhalb dieses Changes; braucht er einen eigenen kleinen Change
   mit Hinweis auf die Verlängerung?
2. **Carousel bis Jahresende**: Mit `promote: {}` bleibt Slender bis
   31. Dezember im Startseiten-Carousel. Gewollt, oder `promote.until`
   früher setzen?
