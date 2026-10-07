# Proposal: Hauptnavigation aufräumen

Ausgeliefert als `feat(navigation)`.

## Why

Die Kopfleiste hat neun Einträge auf oberster Ebene (Übersicht, Blog, Team,
Community-POIs, Events, Projekte, Community, Mehr, Discord) plus
Sprachwahl. Auf einem Desktop von etwa 1480 px läuft sie über: das Logo
„OneLiteFeather“ wird abgeschnitten, „Community-POIs“ bricht auf zwei Zeilen
um. Mit jeder neuen Seite (Events, Projekte, Community) wurde ein weiterer
Eintrag angehängt, ohne dass ein anderer wegfiel.

## What Changes

- **Oberste Ebene auf vier Einträge**: `Team`, `Blog`, `Community▾`, `Mehr▾`,
  danach der Discord-Button und die Sprachwahl.
  - `Community▾`: Übersicht (`/community`), Bauwerke (`/community-poi`),
    Projekte (`/projects`), Events (`/events`).
  - `Mehr▾`: BlueMap, Status (extern).
- **„Spielen“-Button** (gefüllt, primär) links neben Discord, führt auf den
  Verbindungsabschnitt der Startseite (`/<locale>#connect`). „Server verbinden“
  entfällt dafür aus „Mehr“. Discord bleibt der tonale Button. Das mobile Menü
  zeigt dieselben zwei Buttons, „Spielen“ zuerst.
- **Events wandern automatisch**: Gibt es mindestens ein gelistetes Event, das
  angekündigt ist oder läuft (nicht verborgen, nicht `unlisted`, nicht
  vergangen), steht „Events“ auf oberster Ebene hinter „Blog“; sonst bleibt es
  letztes Kind von „Community“. So gibt es keinen leeren Eintrag oberster Ebene,
  solange nichts stattfindet. Die Entscheidung trifft die Orchestrierung
  (`layouts/default.vue`) und reicht sie als Eigenschaft an die Navigation.
- **„Übersicht“ entfällt als Eintrag.** Das Logo führt auf die Startseite und
  bekommt einen zugänglichen Namen, der den sichtbaren Text enthält
  („OneLiteFeather – Startseite“).
- **„Community-POIs“ heißt in der Navigation „Bauwerke“ (en „Builds“).** Nur der
  Navigationstext ändert sich; URLs, Routen und Seitenüberschriften bleiben.
  Der Schlüssel `navigation.community_poi` wird zu `navigation.builds`; keine
  Seite liest ihn.
- **Discord bleibt der hervorgehobene Button** (M3-Button, tonal) am Ende der
  Leiste, die Sprachwahl bleibt unverändert.
- **Mobiles Menü**: Gruppenköpfe haben dieselbe Schrift und Fläche wie die
  Linkzeilen (Chevron als Aufklapp-Hinweis) statt kleinerer Schrift auf eigenem
  Hintergrund.
- **Layout**: Logo und Navigationstexte brechen nicht um und schrumpfen nicht
  (`shrink-0`, `whitespace-nowrap`). Der Umschaltpunkt zum mobilen Menü bleibt
  bei `lg` (siehe `design.md`).
- **Gruppen zeigen den aktiven Zustand**: Liegt die aktuelle Route unter einem
  Kind, trägt auch der Gruppen-Knopf die Aktiv-Markierung.
- **Zugänglichkeit**: Gruppenknöpfe tragen `aria-expanded` und `aria-controls`
  auf ihr Menü; Bedienung per Tastatur wie bisher (nativer `summary`, Escape
  schließt).
- **Mobiles Menü und Schema.org-`SiteNavigationElement`** folgen derselben
  Struktur, weil beide aus `navConfig` gebaut werden.
- **Schutz**: Ein Test begrenzt die Einträge der obersten Ebene auf höchstens
  sechs (ohne Discord und Sprachwahl) und stellt sicher, dass jedes bisher
  erreichbare Ziel erreichbar bleibt.
- Nicht in diesem Change: neue Seiten, geänderte URLs, ein anderes Mobilmuster,
  Außenklick-Schließen der Dropdowns.

## Capabilities

### New Capabilities

- `main-navigation`: Struktur, Beschriftung, Aktivzustand und Zugänglichkeit
  der Hauptnavigation.

### Modified Capabilities

Keine. (`add-community-page` verlangt weiterhin einen Navigationspfad zur
Community-Seite; er liegt nun in der Gruppe „Community“.)

## Impact

- `layers/navigation/navItems.ts` (`buildNavConfig`, `playLink`),
  `components/NavigationBar.vue`, `composables/useSiteNavigationSchema.ts`,
  `utils/navigation.ts`, `utils/navItemClasses.ts`
- `layouts/default.vue`, `composables/useEventsInNav.ts` (neu)
- `layers/content-core` (`listEventSchedules`, Typ `EventScheduleSummary`),
  `shared/utils/eventPhase.ts` (`hasLiveListedEventAt`)
- `i18n/locales/{de,en}.json` (`navigation.builds`, `navigation.home_link`,
  `navigation.community_overview`, `navigation.play`; `navigation.overview`,
  `navigation.community_poi` und `navigation.server` entfallen)
- `tests/navigation/` (neu), `tests/architecture/nav-active-state.spec.ts`,
  `tests/community/page.spec.ts`, `tests/projects/pages.spec.ts`,
  `tests/i18n/label-in-name.spec.ts` (angepasst)
- Keine neuen Abhängigkeiten.
