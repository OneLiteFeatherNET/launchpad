# Design: Schlankere Content-Abfragen

## Context

Motivation: siehe `proposal.md`. Anforderungen: siehe
`specs/content-queries/spec.md`. Edge-Caching ist ein eigener Change; hier
geht es darum, dass ein Cache-Miss weniger D1 liest und weniger Payload
erzeugt.

`@nuxt/content` v3 (3.16.1) baut aus `queryCollection` SQL. `.select()`
projiziert Spalten, JSON-Spalten werden beim Lesen dekodiert, `.first()` hängt
`LIMIT 1` an, `.where(feld, 'IN', [...])` ist ein gültiger `SQLOperator`
(`module.d.mts`), Booleans wandelt der Query-Builder in `0/1`.

## Goals / Non-Goals

**Goals:**
- Weniger gelesene Zeilen, Spalten und SSR-Payload je ungecachtem Rendering.
- Ein Vertrag, den Tests prüfen: welche Felder ein Konsument liest und welche
  die Projektion liefert.

**Non-Goals:**
- Caching, Übersetzungs-Lookups, Carousel-Rendering, Sitemap-Routen.

## Decisions

### D1: `.first()` für Single-Document-Collections
`getSponsorsDocument` macht es vor. Die vier übrigen Methoden holten alle
Zeilen und nahmen `docs[0]`. Gleiches Ergebnis, `LIMIT 1`.

### D2: Zusammenfassungstypen statt `Partial<Document>`
`listEvents` liefert `EventSummary[]`, `listCommunityPois` und
`listFeaturedCommunityPois` liefern `CommunityPoiSummary[]`. Ein eigener Typ
macht den Compiler zum Wächter: Wer ein nicht projiziertes Feld liest, bekommt
einen Typfehler statt `undefined` zur Laufzeit. `EventDocument` bleibt
zuweisbar an `EventSummary`, die bestehenden Listenfunktionen und ihre Tests
laufen unverändert weiter. Die Typen leben in content-core
(`@nuxt/content` darf nur dort genannt werden) und werden als `export type`
über den Layer-Index freigegeben; ein Werte-Export kommt nicht hinzu.

Event-Felder: `slug`, `title`, `summary`, `type`, `thumbnail`, `thumbnailAlt`,
`unlisted`, `event`, `access`, `promote`, `results` (nur für den Namen des
Siegers vergangener Events). `event`/`unlisted`/`promote` sind die Eingaben der
Phasenregel in `shared/utils/eventPhase.ts`.

POI-Felder: was `CommunityPoiCard`, `useHomeContent.poiToSlide` und die
Sortierung lesen: `slug`, `title`, `summary`, `status`, `progress`, `category`,
`featured`, `featuredCaption`, `thumbnail`, `thumbnailAlt`, `location`,
`acceptsContributions`, `builders`, `startedAt`, `updatedAt`.

### D3: Anzahlen statt Listen für die POI-Karte
Die Karte zeigt nur, *wie viele* Galerie-Bilder und Schematics es gibt. Das
Query-Interface kann keine Längen in SQL berechnen. Der Adapter liest daher
`gallery` und `schematics` und reduziert sie auf `galleryCount` und
`schematicCount`, bevor das Ergebnis in den Payload geht. D1 liest die beiden
Spalten weiterhin, der SSR-Payload (die teuerste Stelle) nicht mehr. Die Karte
liest die Anzahlen.

### D4: Kein gemeinsamer Events-Fetch
Geprüft: `pages/index.vue` ruft `useEventPromotions`, `pages/events/index.vue`
nur `useEventsOverview`. Keine Seite ruft beide; ein geteilter Schlüssel
bringt keine Einsparung und würde zwei Zeitentscheidungen koppeln. Verworfen.

### D5: Markierte POIs in SQL
Das Schema hat `featured` (`z.boolean().optional()`, Spalte `BOOLEAN`).
`listFeaturedCommunityPois` filtert mit `.where('featured', '=', true)`. Die
Sortierung (Status, dann Aktualität) bleibt im Composable, sie ist
Domänenlogik und steht nicht im Adapter (`repository-sort-contract.spec.ts`).

### D6: Autor:innen mit `IN`, Reihenfolge im Composable
`listAuthorsBySlugs(slugs)` liefert `[]` ohne Abfrage bei leerer Liste und
projiziert auf die Felder von `BlogAuthorProfile` (ohne `body`). `IN` garantiert
keine Reihenfolge; `useBlogContent` ordnet nach der Frontmatter-Reihenfolge.
`getAuthorBySlug` bleibt im Repository.

## Messung

Methode: `pnpm build`, dann `pnpm preview` (lokaler Build, D1 emuliert,
Port 8787), je Seite `curl` und Länge des Inhalts von
`<script id="__NUXT_DATA__">` sowie die HTML-Gesamtgröße in Bytes; vorher auf
`origin/main`, nachher mit diesem Change. Seiten: `/en`, `/en/events`,
`/en/community-poi`, `/en/blog/dev-blog-1-what-we-using`. Auf `main` gibt es
keine Event-Inhalte, die Event-Übersicht ist daher leer und zeigt keinen
Unterschied; der Gewinn dort entsteht erst mit Inhalten.

Vorher (`origin/main`):

| Seite | HTML gesamt (B) | `__NUXT_DATA__` (B) |
| --- | --- | --- |
| `/en` | 118269 | 29090 |
| `/en/events` | 38244 | 1017 |
| `/en/community-poi` | 83487 | 20360 |
| `/en/blog/dev-blog-1-what-we-using` | 74202 | 9788 |

Nachher:

| Seite | HTML gesamt (B) | `__NUXT_DATA__` (B) |
| --- | --- | --- |
| `/en` | 98732 (-16,5 %) | 9611 (-67 %) |
| `/en/events` | 38244 (0) | 1017 (0) |
| `/en/community-poi` | 66790 (-20 %) | 3713 (-82 %) |
| `/en/blog/dev-blog-1-what-we-using` | 73784 (-0,6 %) | 9370 (-4 %) |

Abfragen je Rendering (Inhalt der Seite, ohne Layout und Übersetzungen):
`/en` bleibt bei 5 (Konzept, Verbindung, Carousel, markierte POIs,
Event-Promotions); statt aller POI-Zeilen mit allen Spalten liest sie nur die
markierten. Ein Artikel mit N Autor:innen braucht statt N nur 1
Autorenabfrage (der Beispielartikel hat einen Autor, daher keine Änderung der
Anzahl; der Payload sinkt, weil der Autoren-Body entfällt).

## Risks / Trade-offs

- Eine zu knappe Projektion lässt Karten still leer rendern. Gegenmaßnahme:
  Typen (Compiler) plus Tests, die Konsumenten-Felder gegen die Projektion
  prüfen.
- D3 verlagert Arbeit in den Adapter, spart aber nur Payload, keine D1-Bytes.
