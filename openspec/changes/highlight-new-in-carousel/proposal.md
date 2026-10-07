# Proposal: Neues im Karussell hervorheben

Ausgeliefert als `feat(home)`.

## Why

Das Startkarussell zeigt handgepflegte Einträge aus `content/carousel/<locale>/home.json`.
Wer die Seite besucht, sieht deshalb nicht, was in den letzten Wochen auf der Website
hinzugekommen ist: neue Blogartikel, Projekte oder Bauten. Die handgeschriebenen
Blog-Slides tragen Titel, Bild und Autor als Kopie (`"author": "Phillipp Glanz"`) und
veralten, sobald sich der Artikel ändert. Neue Inhalte tauchen erst auf, wenn jemand
daran denkt, die JSON-Datei anzupassen.

## What Changes

- **Das Karussell hebt Neues hervor**: Inhalte, die in den letzten 30 Tagen **auf der
  Website veröffentlicht** wurden, erscheinen als Slides mit Hinweis „Neu“ / „New“,
  das jüngste zuerst. Quellen: freigegebene Blogartikel, Community-POIs, Projekte
  und Events.
- **Slides werden aus dem Inhalt erzeugt**: Titel, Bild, Auszug und Autor kommen aus
  dem Quelldokument, Autoren über den bestehenden Personen-Resolver.
- **„Neu“ heißt: auf der Website veröffentlicht**, nicht „im Spiel begonnen“ oder
  „erste stabile Version“. Dafür bekommen `projects` und `community_poi` ein
  optionales Feld `publishedAt`. Blogartikel nutzen `releaseDate ?? pubDate`,
  Events bleiben bei ihrer bestehenden Bewerbungslogik (`promote`, gelistet) und
  gelten ab `announceAt` 30 Tage als neu. Fehlt `publishedAt`, ist der Eintrag
  nie „neu“; es werden keine Daten erfunden.
- **`home.json` bleibt für Kuratiertes**: Stimmungsbilder und Ankündigungen füllen
  nach den neuen Slides auf und sind der Rückfall, wenn nichts neu ist. Die
  handgeschriebenen Blog-Slides entfallen (de und en), weil sie erzeugte Slides
  doppeln würden. Ein kuratierter Slide mit gleichem `href` wie ein erzeugter
  entfällt.
- **Obergrenze**: höchstens 6 neue Slides aus Blog, POIs und Projekten; die
  beworbenen Events (höchstens 2, bestehende Regel) stehen davor.
- **„Jetzt“ ist ein Parameter** der reinen Funktionen und wird einmal auf dem Server
  im Datenhandler entschieden; der Browser fragt die Uhr nicht erneut.
- **ARCR**: `publishedAt: 2026-10-07` in de und en.

Nicht in diesem Change: neue Slide-Optik außer dem Hinweis, Lokalisierung der
bereits festen Texte „von“ / „Lesen“ im Blog-Slide, Redaktionswerkzeuge.

## Capabilities

### New Capabilities

- `home-carousel-highlights`: Fenster, Quellen, Reihenfolge, Obergrenze, Hinweis „Neu“, Rückfall.
- `publication-date`: optionales Feld `publishedAt` an Projekten und Community-POIs.

### Modified Capabilities

Keine.

## Impact

- `content.config.ts` (`publishedAt` an `projects` und `community_poi`)
- `layers/content-core/utils/content/{repository,nuxtContentAdapter}.ts`
- `layers/home/` (`utils/highlights.ts`, `types-carousel.ts`, `components/Carousel*.vue`,
  `composables/useCarousel.ts`, `index.ts`)
- `layers/events/utils/eventLists.ts` (`announcedAt` an der Karte)
- `composables/useHomeHighlights.ts` (neu), `pages/index.vue`
- `content/carousel/{de,en}/home.json`, `content/projects/{de,en}/anti-redstoneclock-remastered.md`
- `i18n/locales/{de,en}.json`
- `tests/home/`, `tests/content/`, `tests/a11y/`
- Keine neuen Abhängigkeiten.
