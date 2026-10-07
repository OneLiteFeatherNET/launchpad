# Proposal: Schlankere Content-Abfragen für ungecachte Renderings

Ausgeliefert als `perf(content)`.

## Why

Die Edge-Cache-Treffer sind schnell, jeder Cache-Miss dagegen geht gegen D1.
Dort liest die Seite heute mehr, als sie anzeigt: Die Übersichten für Events
und Community-POIs sowie die Startseite laden vollständige Dokumente
(Galerie, Ressourcen, Schematics, Bauleute, Ergebnisse, Markdown-Body), obwohl
Karten nur wenige Felder zeigen; die Startseite lädt *alle* POIs, um die
markierten herauszufiltern; Single-Document-Collections holen mit `.all()`
alle Zeilen und nehmen die erste; ein Blogartikel schickt pro Autor:in eine
eigene Abfrage. Das kostet D1-Roundtrips, gelesene Bytes und SSR-Payload auf
jedem ungecachten Aufruf.

## What Changes

- **Single-Document-Collections lesen höchstens eine Zeile**: `getTeamDocument`,
  `getServerConcept`, `getServerConnect`, `getHomeCarousel` nutzen `.first()`
  statt `.all()` und `docs[0]`, wie `getSponsorsDocument`.
- **Listenabfragen liefern nur Kartenfelder**: `listEvents` und
  `listCommunityPois` projizieren per `.select()` auf das, was Übersicht,
  Karten und Startseite lesen, und liefern neue Zusammenfassungstypen
  (`EventSummary`, `CommunityPoiSummary`). Detailabfragen bleiben vollständig.
  Die POI-Karte zeigt Anzahlen für Galerie und Schematics; der Adapter
  reduziert diese Listen auf `galleryCount` und `schematicCount`, damit sie
  nicht im Payload landen.
- **Markierte POIs filtert SQL**: neue Methode `listFeaturedCommunityPois`
  (`WHERE featured = 1`) statt der ganzen Collection auf der Startseite.
- **Autor:innen eines Artikels in einer Abfrage**: neue Methode
  `listAuthorsBySlugs` (`WHERE slug IN (...)`), ersetzt N Einzelabfragen.
- **Geprüft und verworfen**: `useEventsOverview` und `useEventPromotions`
  teilen sich keine Seite (Startseite nutzt nur die Promotions, die
  Event-Übersicht nur die Übersicht), ein gemeinsamer Fetch bringt nichts.
- Nicht in diesem Change: Übersetzungs- und Hreflang-Abfragen, Cache-Header,
  Carousel-Rendering, neue Abhängigkeiten, die Sitemap-Routen unter
  `server/api/__sitemap__/`.

## Capabilities

### New Capabilities

- `content-queries`: Verhalten der Content-Abfragen gegenüber D1: wie viele
  Zeilen und welche Felder sie lesen und wie viele Abfragen ein Rendering
  braucht.

### Modified Capabilities

_Keine._

## Impact

- `layers/content-core/utils/content/{repository,nuxtContentAdapter}.ts`,
  `layers/content-core/index.ts` (nur Typ-Exporte)
- `layers/events`: `types.ts`, `utils/eventLists.ts`
- `layers/community-poi`: `types.ts`, `components/CommunityPoiCard.vue`,
  `components/CommunityPoiGrid.vue`
- `layers/home/composables/useHomeContent.ts`,
  `layers/blog/composables/useBlogContent.ts`
- Tests unter `tests/content/` und `tests/events/`
- Keine neuen Abhängigkeiten, keine Migration, keine Schemaänderung.
