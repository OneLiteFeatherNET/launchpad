# Proposal: Events-Bereich mit Lebenszyklus, Zugang und Carousel-Promotion

## Why

OneLiteFeather veranstaltet Bau-Events, Spiel-Events, Adventure-Events sowie
Closed und Open Betas, doch die Website kennt Events heute nur als von Hand
gepflegten Carousel-Slide (`type: 'event'` in `content/carousel/<locale>/home.json`)
ohne eigene Seite, ohne Erklärung, ohne Bilder, ohne Teilnahmeweg und ohne
Archiv. Wer wissen will, was läuft, wie man mitmacht oder was früher war,
findet es nur auf Discord. Ein Event muss außerdem von selbst erscheinen und
wieder verschwinden, statt dass jemand zum richtigen Zeitpunkt Slides
umschreibt.

## What Changes

- **Neue Seite `/<locale>/events`** mit drei Sektionen: *Aktuell* (laufende
  Events, sonst ein Leerhinweis mit Discord-Verweis), *Demnächst* (nur wenn
  angekündigte Events existieren) und *Vergangen* (Archiv, neueste zuerst).
- **Neue Detailseite `/<locale>/events/<slug>`** mit stabiler URL über alle
  Phasen: Kopf mit Typ, Zeitraum und Status, typspezifischer Block, freier
  Markdown-Text, Galerie, Ressourcen und ein Block „So nimmst du teil“.
- **Lebenszyklus pro Event, zur Anfragezeit bestimmt**: vor `announceAt`
  (bzw. `startsAt`) unsichtbar und 404; danach *angekündigt*, *läuft*,
  *vergangen*. Vergangene Events bleiben erreichbar, gelistet und
  indexierbar.
- **Event-Modell mit drei unabhängigen Achsen**: Format `type`
  (`build | play | adventure | beta`), Zugang `access.mode`
  (`open | signup | application | invite`, für alle Formate, Standard
  `open`) und – nur bei Betas – Gegenstand `subject.kind`
  (`gamemode | feature | offer`).
- **Carousel-Promotion**: laufende Events erscheinen automatisch vorne im
  Startseiten-Carousel, maximal zwei, nach Start sortiert. Das Zeitfenster
  ist per `promote.from`/`promote.until` steuerbar (Standard: Laufzeit) oder
  mit `promote: false` abschaltbar. Handgepflegte `event`-Slides bleiben
  möglich.
- **Anleitungen je Rolle**: der Markdown-Text eines Events kann Anleitungen
  enthalten, auch mehrere für verschiedene Rollen (z. B. *Survivor* und
  *Slender*), die als Tabs erscheinen und nach dem Event nachlesbar bleiben.
- **Test-Block für Betas**: was getestet wird, bekannte Probleme und ein
  Feedback-Weg, solange der Test läuft.
- **Ergebnis für alle Formate**: nach dem Ende zeigt die Detailseite oben ein
  Ergebnis (Fazit, Platzierungen, Zahlen, „Wie geht es weiter“) bzw. „Ergebnisse
  folgen“; Archivkarten nennen den Sieger. Ersetzt die Bau-spezifischen
  `build.results`.
- **Menüpunkt „Events“** in der Hauptnavigation, immer sichtbar.
- **Sitemap-Quelle** für Events, die nur sichtbare Events listet.
- **Wiederverwendbare Bausteine nach `base`**: Galerie und Ressourcenliste
  werden aus `community-poi` herausgelöst (`MediaGallery`, `ResourceList`),
  dazu neu `DateRange` und `EmptyState`. `community-poi` stellt auf sie um.
- **Alles auf Material Design 3**: neue Komponenten verwenden ausschließlich
  Rollen-Tokens und die `M3*`-Primitives und stehen nicht in der
  Migrations-Ausnahmeliste des Governance-Tests.

Nicht Teil dieser Change: **Spiele** als eigenes, dauerhaftes Objekt
(`/<locale>/games`) und die Überführung eines Events in ein Spiel. Beides
folgt als eigenes Proposal; ein beendetes Event bleibt dafür unter seiner URL
erreichbar, sodass die spätere Überführung dort anknüpfen kann. Ebenfalls
nicht enthalten: Live-Kennzeichnung im Menü, Teilnehmerzähler und
Anmeldeformulare auf der Website selbst.

## Capabilities

### New Capabilities
- `events`: Event-Inhaltsmodell, Lebenszyklus und Sichtbarkeit, Übersichts-
  und Detailseite, Zugangs- und Teilnahmedarstellung, Carousel-Promotion,
  Menüeintrag und Sitemap-Aufnahme.
- `shared-content-blocks`: domänenneutrale, wiederverwendbare Bausteine in
  `base` (Mediengalerie, Ressourcenliste, Zeitraum, Leerzustand), die
  mehrere Domänen-Layer nutzen.

### Modified Capabilities
<!-- openspec/specs/ ist leer; es existiert keine Capability, deren
     Anforderungen sich ändern. -->

## Impact

- **Neu**: `layers/events/` (Typen, Composables, Komponenten, `index.ts`),
  `content/events/{de,en}/*.md`, `pages/events/index.vue`,
  `pages/events/[...slug].vue`, `shared/utils/eventPhase.ts` (Phasenlogik für
  App und Nitro), `server/api/__sitemap__/events.ts`, i18n-Schlüssel in
  beiden Sprachen.
- **Geändert**: `content.config.ts` (lokalisierte `events`-Collection),
  `layers/content-core/utils/content/{repository,nuxtContentAdapter}.ts`
  (Event-Abfragen), `layers/navigation/navItems.ts` (Eintrag),
  `pages/index.vue` (Event-Slides einmischen), `nuxt.config.ts`
  (Sitemap-Quelle), `layers/community-poi` (Umstellung auf `MediaGallery`/
  `ResourceList`), `tests/architecture/module-boundaries.spec.ts` (Ausnahme
  für die Sitemap-Route nach dem Muster von `team`).
- **Abhängigkeit**: setzt aus `adopt-md3-design-system` mindestens
  Abschnitt 6 (`M3Card`, `M3Divider`, `SectionHeading`) und für die
  Carousel-Darstellung Abschnitt 8 voraus. MD3-Task 10.1 migriert
  `CommunityPoiGallery` nicht mehr selbst, sondern stellt auf `MediaGallery`
  um.
- **Betrieb**: Zeitabhängige Darstellung unterliegt dem Edge-Cache aus
  `edge-caching-and-seo` (bis ~1 h Verzug beim Phasenwechsel, akzeptiert).
  Keine neuen Abhängigkeiten.
