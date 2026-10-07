# Design: Neues im Karussell

## Context

Motivation: `proposal.md`; Anforderungen: `specs/`. Befunde am Stand `origin/main` (`0abf925`):

- `pages/index.vue` setzt das Karussell aus beworbenen Events (`useEventPromotions`)
  und `useHomeContent().slides` (`home.json` plus Featured-POIs) zusammen.
- Der Edge-Cache hält HTML 600 s (SWR 3600 s); zeitabhängige Ausgabe hinkt bis zu
  rund 70 Minuten nach. Für „letzte 30 Tage“ ist das unerheblich.
- Domänen kennen einander nicht; das Zusammenführen gehört in `pages/` oder
  Wurzel-Composables. `useCommunityOverview` ist das Vorbild: ein
  `useAsyncData`, `now` im Handler, reine Funktion in einer Layer.
- `tests/architecture/home-data-waterfall.spec.ts` verlangt, dass Daten auf
  Seitenebene geholt werden.

## Decisions

**D1 Fenster und Grenzen.** Neu ist `0 <= now - publishedAt <= 30 Tage`. Ein
Datum in der Zukunft ist nicht neu; ein fehlendes oder unlesbares ebenso wenig.

**D2 Datum je Quelle.** Blog: `releaseDate ?? pubDate` (`releaseTimeOf`, nur
freigegebene via `isReleasedAt`). Community-POI und Projekt: `publishedAt`.
`startedAt` (Baubeginn) und `releasedAt` (erste stabile Version) sagen nichts
darüber, wann der Eintrag auf der Website erschien. Events: die bestehende
`promotedEventsAt` entscheidet, was erscheint (gelistet, im Bewerbungsfenster,
höchstens 2); der Hinweis „Neu“ gilt, wenn `announceAt` im Fenster liegt. Die
Eventkarte bekommt dafür `announcedAt`.

**D3 Reihenfolge und Obergrenze.** Beworbene Events zuerst (wie bisher), danach
die neuen Slides aus Blog, POIs und Projekten nach Datum absteigend (Gleichstand:
`href` aufsteigend), höchstens 6. Danach die kuratierten Slides, wobei jeder mit
einem `href` eines erzeugten entfällt. Ohne Neues bleibt nur Kuratiertes.

**D3a Auffüllen.** Weil die entfernten Blog-Slides das Karussell sonst ärmer
machen, füllt `composeSlides` unter `MIN_SLIDES = 5` mit `recentSlides` auf: nicht
neue, freigegebene Artikel, POIs und Projekte ohne Hinweis, jüngstes zuerst,
Duplikate nach `href` übersprungen. Der Handler legt höchstens 5 davon in die
Payload (`recent`) und löst deren Autoren mit auf.

**D4 Wo was liegt.** `layers/home/utils/highlights.ts` hält reine Funktionen über
einfachen Daten (`isNewAt`, `freshSlides`, `eventSlide`, `composeSlides`); die
Layer importiert nur Typen anderer Domänen und `#shared/utils/blogAuthors`.
`composables/useHomeHighlights.ts` (Wurzel) holt Blog, POIs, Projekte und Autoren in
einem `useAsyncData`, entscheidet `now` im Handler und legt `{ now, slides }` in
die Payload. `pages/index.vue` ruft es auf Seitenebene auf und fügt Events und
Kuratiertes mit `composeSlides` zusammen.

**D5 Repository.** `publishedAt` kommt in die projizierten Karten
(`PROJECT_CARD_FIELDS`, `communityPoiSummaries`). Die Blogliste liefert bereits
`pubDate`, `releaseDate`, `author`, `headerImage`, `description`. `path` und `stem`
verlassen den Adapter nicht.

**D6 Barrierefreiheit.** Der Hinweis ist sichtbarer Text im Chip. `getSlideLabel`
stellt „Neu: “ / „New: “ voran, damit Slide-Ansage und Beschriftung den Hinweis
tragen. Neuer Slide-Typ `project` mit eigener Komponente.

## Risks

- `publishedAt` muss redaktionell gepflegt werden; ohne Wert erscheint nichts.
  Gewollt: kein erfundenes Datum.
- Zeitabhängige Ausgabe im Edge-Cache hinkt nach (siehe Context).
