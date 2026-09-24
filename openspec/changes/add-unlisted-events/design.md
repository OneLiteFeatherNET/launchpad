# Design: Nicht gelistete Events

## Context

Motivation: siehe `proposal.md`. Anforderungen: siehe `specs/events/spec.md`.

Der Bestand aus `add-events-section`, auf dem dieser Change aufsetzt:

- **Sichtbarkeit ist heute eine Achse.** `eventPhaseAt` in
  `shared/utils/eventPhase.ts` liefert `hidden | announced | running | past`;
  `isEventVisibleAt` ist „nicht hidden“. Drei Stellen filtern damit:
  `groupEventsAt` (Übersicht), `promotedEventsAt` über `isPromotedAt`
  (Carousel) und `visibleEventSitemapEntries` in `shared/utils/eventRoutes.ts`
  (Sitemap, aufgerufen aus `server/api/__sitemap__/events.ts`).
- **Die Detailseite** lädt über `useEventDetail`, das bei `hidden` `null`
  liefert und daraus 404 macht. `EventDetail.phase`, `EventPhaseChip` und
  `EventTestingBlock` sind auf `Exclude<EventPhase, 'hidden'>` typisiert.
- **`usePageSeo`** kennt bereits `noindex` (`layers/content-core/types-seo.ts`).
- **Die Sitemap-Collection** hat bewusst kein `defineSitemapSchema`; die
  Server-Route ist die einzige Quelle für Event-URLs.
- **Die Phase wird im `useAsyncData`-Handler bestimmt** und im Payload
  mitgegeben (D4 von `add-events-section`), damit es keine
  Hydration-Mismatches gibt.

## Goals / Non-Goals

**Goals:**
- Eine gemeinsame Regel „gelistet?“ für Übersicht, Carousel und Sitemap,
  genauso geteilt wie die Phasenlogik.
- Keine Änderung für Events ohne `unlisted`.

**Non-Goals:**
- Zugriffsschutz. „Nicht gelistet“ heißt „nicht auffindbar“, nicht
  „geheim“. Wer den Slug rät, sieht die Seite.
- Zeitgesteuertes Umschalten von nicht gelistet auf gelistet. Öffentlich
  wird ein Event, indem man `unlisted` entfernt und neu deployt.
- Der Slender-Inhalt; er folgt als eigener Change.

## Decisions

### D1 – Ein Boolean `unlisted`, nicht `visibility`-Enum oder `listed: false`

`eventsSchema` erhält `unlisted: z.boolean().optional()`. Das wird eine
Boolean-Spalte in D1; ohne Angabe gilt `false`, sodass bestehende Dateien
unverändert bleiben.

Verworfen: `visibility: 'public' | 'unlisted'`. Ein dritter Wert ist nicht
absehbar, und ein Enum braucht bei jeder Abfrage einen Vergleich statt einer
Wahrheitsprüfung. Ebenfalls verworfen: `listed: false`, weil ein Feld, dessen
sinnvoller Wert nur `false` ist, in Frontmatter leicht falsch gelesen wird.
Verworfen wurde auch `listed: { from }` (zeitgesteuerte Freigabe), da es nicht
gefordert ist (siehe Non-Goals).

### D2 – Zwei Prädikate in `shared/utils/eventPhase.ts`

```ts
isEventListedAt(schedule, unlisted, now)     // !unlisted && isEventVisibleAt(schedule, now)
isEventReachableAt(schedule, unlisted, now)  // unlisted || isEventVisibleAt(schedule, now)
```

`groupEventsAt`, `promotedEventsAt` und `visibleEventSitemapEntries` filtern
mit `isEventListedAt`; `useEventDetail` entscheidet über 404 mit
`isEventReachableAt`. `eventPhaseAt` bleibt unverändert: Die Phase beschreibt
den Zeitplan, `unlisted` die Auffindbarkeit. Beides zu einer Funktion zu
mischen würde „vergangen, aber nicht gelistet“ unausdrückbar machen.

`EventSitemapSource` erhält `unlisted?: boolean`. Die Sitemap-Route liest es
aus der Collection mit. Dafür ist keine neue Grenzüberschreitung nötig, weil
sie die Dokumente schon vollständig lädt.

Verworfen: den Filter in `isPromotedAt` einzubauen. Das würde dessen
Signatur für ein Anliegen erweitern, das Übersicht und Sitemap genauso
betrifft. Ein einziges Prädikat vor allen drei Listen ist leichter zu prüfen.

### D3 – `hidden` erreicht die Detailseite nur als Vorschau

`EventDetail.phase` wird zu `EventPhase` (inklusive `hidden`). Das kann nur
bei nicht gelisteten Events vorkommen, weil `isEventReachableAt` alle anderen
vorher aussortiert. `EventPhaseChip` bildet `hidden` auf das Label
`events.phase.hidden` („Vorschau“ / „Preview“) in neutraler Farbe ab. Der
Kopf der Detailseite behandelt `hidden` wie `announced`: Hinweis
`events.phase_hint.hidden` („Startet am“ / „Starts on“) mit `DateRange`.
`EventTestingBlock` akzeptiert `hidden` und verhält sich wie bei
`announced` (Feedback-Link sichtbar). `EventResults` bleibt an `past`
gebunden.

Weil die Phase weiterhin im `useAsyncData`-Handler bestimmt wird, gilt die
Hydration-Garantie aus D4 von `add-events-section` unverändert.

Verworfen: `hidden` für nicht gelistete Events auf `announced` abzubilden.
Das wäre eine falsche Aussage („angekündigt“), obwohl noch nichts
angekündigt ist.

### D4 – `noindex` über `usePageSeo`

`pages/events/[...slug].vue` übergibt `noindex: event.unlisted === true`.
`usePageSeo` wird schon nach `await useEventDetail()` aufgerufen, das Event
ist dann bekannt. Canonical, hreflang und Schema.org bleiben wie bei
öffentlichen Events, denn `noindex` genügt, um die Seite aus dem Index
herauszuhalten.

Verworfen: eine `routeRules`-Regel. Die Sichtbarkeit steht im Inhalt, nicht
in der Route, und sie ist erst zur Anfragezeit bekannt.

### D5 – Widersprüche fängt die Inhaltsprüfung ab, nicht die Laufzeit

`tests/content/events-frontmatter.spec.ts` lehnt `unlisted: true` zusammen
mit einem `promote`-Objekt ab, ebenso abweichende `unlisted`-Werte zwischen
Sprachfassungen mit gleichem `translationKey`. Zur Laufzeit gewinnt
`unlisted` ohnehin (D2). Die Prüfung macht den Widerspruch aber für
Redakteure sichtbar, statt ihn still zu übergehen.

## Risks / Trade-offs

- [Ein kurzer Slug wie `slender` ist leicht zu raten] → Das ist bewusst
  hingenommen (Non-Goal). Wenn Vertraulichkeit zählt, wählt die Redaktion
  einen längeren Slug. Das kommt als Hinweis in den Content-Change für
  Slender.
- [Der Link wird öffentlich geteilt, Suchmaschinen finden ihn] → `noindex`
  hält die Seite aus dem Index, auch wenn sie verlinkt wird.
- [Edge-Cache: Nach dem Entfernen von `unlisted` erscheint das Event bis zu
  ~70 min verzögert in Übersicht und Sitemap] → Das ist unkritisch und
  entspricht dem bestehenden Verhalten bei Phasenwechseln.
- [Ein redaktioneller Carousel-Slide kann weiterhin von Hand auf ein nicht
  gelistetes Event verlinken] → Das ist gewollt: eine bewusste redaktionelle
  Entscheidung, keine automatische.

## Migration Plan

Keine Datenmigration. Die neue D1-Spalte entsteht beim nächsten Build aus dem
Schema, und bestehende Einträge lesen sie als leer, also gelistet.
Rollback: den Change zurücknehmen. Nicht gelistete Events fallen dann auf das
Zeitplan-Verhalten zurück (404 bis `announceAt`, danach gelistet). Vor einem
Rollback muss deshalb jede Datei mit `unlisted: true` entfernt oder in die
Zukunft datiert werden.

`add-events-section` muss vor diesem Change archiviert werden, damit die
MODIFIED-Anforderungen in `openspec/specs/events/spec.md` ein Ziel haben.
