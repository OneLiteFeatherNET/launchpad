# Design: Events-Bereich

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe
`specs/events/spec.md` und `specs/shared-content-blocks/spec.md`.

Rahmenbedingungen aus dem Bestand, die den Ansatz formen:

- **SSR im Cloudflare Worker** (`cloudflare_module`), Inhalte per
  `@nuxt/content` aus D1. Zeitabhängige Sichtbarkeit zur Anfragezeit ist
  damit möglich; `useBlogContent.isReleased()` tut das bereits für
  `releaseDate`.
- **Edge-Cache** aus `edge-caching-and-seo`: HTML unter `/de/**`, `/en/**`
  ist 3600 s frisch plus Stale-While-Revalidate. Ein Phasenwechsel wird
  erst beim nächsten Rendern sichtbar.
- **Dependency-Regel** (`tests/architecture/module-boundaries.spec.ts`):
  Fach-Layer importieren einander nicht; nur `pages/`, `layouts/`, `app.vue`
  kombinieren Domänen. Nur `content-core` nennt `@nuxt/content`.
- **Nitro erreicht App-Code nicht** zuverlässig; Code für beide Seiten gehört
  nach `shared/utils` (nur oberste Ebene wird gescannt). `shared/` existiert
  noch nicht.
- **Layer-Namen erzeugen kein Präfix**: Komponentennamen müssen global
  eindeutig sein (`layer-name-collisions.spec.ts`).
- **MD3-Governance** (`md3-governance.spec.ts`) prüft jede neue Datei unter
  `layers/**` außer `base`. `M3Button`, `M3IconButton`, `M3Chip` existieren;
  `M3Card`, `M3Divider`, umgebautes `SectionHeading` und das migrierte
  Carousel kommen aus Abschnitt 6 bzw. 8 der MD3-Change.
- **Vorbild Community-POI**: lokalisierte `page`-Collection mit
  `withI18nMeta`, Übersetzungsverknüpfung per `translationKey` und
  `useSetI18nParams`, Galerie und Schematic-Liste als eigene Komponenten.
- **Vorbild Team-Sitemap**: `server/api/__sitemap__/team.ts` als
  Sitemap-Quelle mit registrierter Boundary-Ausnahme.

## Goals / Non-Goals

**Goals:**
- Eine einzige, reine Phasenfunktion, die App und Sitemap teilen.
- Keine Hydration-Mismatches an Phasengrenzen.
- Events-Layer ohne Kenntnis von `home` oder `navigation`; die
  Zusammenführung passiert in `pages/`.
- Galerie und Ressourcenliste existieren danach genau einmal, in `base`.

**Non-Goals:**
- Exakter Phasenwechsel auf die Minute (Cache-Verzug wird akzeptiert,
  kein gezieltes Purgen).
- Clientseitiges Nachrechnen der Phase ohne Neuladen (kein Live-Countdown).
- Filter, Suche oder Paginierung in der Übersicht.
- Spiele-Objekt und Überführung Event → Spiel (eigenes Proposal).

## Decisions

### D1 – Eine lokalisierte `page`-Collection `events_<locale>`

`content/events/<locale>/*.md`, definiert über
`defineLocalizedCollections('events', …)` mit `withI18nMeta` wie
`community_poi`. Frontmatter trägt das Modell, der Markdown-Body die freie
Erklärung.

```yaml
slug: herbst-bauevent
title: Herbst-Bauevent
summary: …
type: build                    # build | play | adventure | beta
thumbnail: /images/events/…    # optional
thumbnailAlt: …
event:
  announceAt: 2026-09-20T12:00:00+02:00   # optional
  startsAt:   2026-10-01T18:00:00+02:00
  endsAt:     2026-10-14T23:59:00+02:00   # optional
access:                        # optional, fehlt = { mode: open }
  mode: application            # open | signup | application | invite
  requirements: [Lite-Rang]
  opens:  …
  closes: …
  url: https://…
  note: …
join:                          # optional, Beitrittsweg bei open
  server: true                 # Serveradresse aus server_connect anzeigen
  discord: https://…
promote:                       # optional; false schaltet ab
  from:  …
  until: …
subject:                       # nur type: beta, Pflicht
  kind: gamemode               # gamemode | feature | offer
  name: Maze
build:                         # optional, nur type: build
  theme: …
  submissionDeadline: …
testing:                       # optional, nur type: beta
  focus: [ … ]
  knownIssues: [ … ]
  feedbackUrl: https://…
results:                       # optional, alle Formate, sichtbar erst „vergangen“
  summary: …
  placements: [{ place: 1, name: …, mcName: …, image: …, imageAlt: … }]
  stats: [{ label: Teilnehmer, value: '42' }]
  outcome: [ … ]               # „Wie geht es weiter“
play:                          # optional, nur type: play
  teamSize: …
  modeSummary: …
adventure:                     # optional, nur type: adventure
  mapVersion: …
  minecraftVersion: …
gallery: [{ src, alt, caption?, width?, height? }]
resources: [{ kind: download|link|discord|schematic, name, url, description?, format?, version?, sizeLabel? }]
```

Die typspezifischen Felder liegen in je einem eigenen Objekt statt flach auf
oberster Ebene, damit ein Typ-Block genau ein Feld liest und neue Formate
keine Namenskollisionen erzeugen. Alternative „ein flaches Schema mit
optionalen Feldern“ verworfen: bei vier Formaten wird unklar, welches Feld
wozu gehört.

**zod ist hier Spaltendefinition, keine Validierung** (siehe
`nuxt-content-cms`-Skill). Die in der Spec geforderten Prüfungen – Offset
an Zeitpunkten, Reihenfolge der Zeitpunkte, `url` bei `signup`/`application`,
`subject` bei `beta` – laufen deshalb als Test
`tests/content/events-frontmatter.spec.ts`, der die Dateien mit dem
vorhandenen `yaml`-Paket liest (wie `frontmatter-parses.spec.ts`).
`schema-columns.spec.ts` deckt ab, dass jedes genutzte Feld als Spalte
existiert.

`results` gilt für alle Formate – ein Spielabend hat Sieger, ein Test hat ein
Fazit und nächste Schritte. Es ersetzt das anfangs Bau-spezifische
`build.results`. `stats[].value` ist ein String, damit „42“, „3 h“ und
„> 100“ gleichermaßen gehen.

### D2 – Repository-Zugriff über `content-core`

`ContentRepository` erhält `listEvents(locale)`, `getEventBySlug(locale,
slug)`, `getEventByTranslationKey(locale, key)` sowie den Typ
`EventDocument` – spiegelbildlich zu den POI-Methoden. `layers/events/types.ts`
leitet daraus schlichte Typen ab (`EventEntry`, `EventPhase`, `EventAccess`
…). Für `join.server` liest der Events-Layer die Serveradresse über die
bestehende `server_connect`-Methode des Repositorys; das ist erlaubt, weil
`content-core` allen offensteht, und vermeidet einen Import aus `home`.

### D3 – Phasenlogik als reine Funktion in `shared/utils/eventPhase.ts`

```ts
eventPhaseAt(event, now): 'hidden' | 'announced' | 'running' | 'past'
isPromotedAt(event, now): boolean
isAccessOpenAt(access, now): boolean
```

Die Funktionen nehmen nur schlichte Datenfelder und `now` entgegen, kennen
weder Vue noch H3 und liegen auf oberster Ebene von `shared/utils`, damit
Nuxt sie auf App- und Nitro-Seite automatisch importiert. So verwenden
Seiten und Sitemap-Route dieselbe Regel. Alternative „Logik im
Events-Layer, Sitemap per `~/layers/...`-Import“ verworfen: AGENTS.md
verbietet Laufzeit-Importe über diese Grenze, und die Team-Ausnahme betrifft
nur `locales`.

`shared/` wird damit erstmals angelegt. Nur diese eine Datei; keine
verschachtelten Ordner.

### D4 – „Jetzt“ wird einmal serverseitig festgelegt und im Payload mitgegeben

Die Composables (`useEventsOverview`, `useEventDetail`, `useEventPromotions`)
berechnen Phase, Promotion und Zugangsfenster **im `useAsyncData`-Handler**
und liefern fertige Ergebnisse (`phase`, `accessOpen`, sortierte Listen)
samt dem verwendeten `now` als ISO-String. Der Client übernimmt sie aus dem
Payload und rechnet nicht neu. Damit sind Server- und Client-Darstellung
identisch, auch wenn eine Phasengrenze zwischen Rendern und Hydrieren liegt,
oder wenn die Seite aus dem Edge-Cache kommt.

Alternative „Phase als `computed` aus `Date.now()`“ verworfen: erzeugt genau
den Mismatch, den die Spec ausschließt. Alternative „Phase im
`ClientOnly`“ verworfen: Inhalt wäre ohne JavaScript und für Crawler leer.

Nicht gefundene oder verborgene Events lösen im Detail-Composable
`createError({ statusCode: 404 })` aus – wie beim Blog.

### D5 – Zeitformatierung mit fester Zeitzone

`DateRange` formatiert über `Intl.DateTimeFormat` mit explizitem
`timeZone: 'Europe/Berlin'` und `timeZoneName: 'short'` in der Seiten-Locale.
Ohne feste Zeitzone würde der Server (UTC) anders formatieren als der
Browser des Besuchers. `datetime` erhält `toISOString()`.

### D6 – Carousel-Zusammenführung im Orchestrator

`layers/events` exportiert `useEventPromotions()`, das höchstens zwei
beworbene Events als schlichte Objekte liefert (Titel, Start, Ende, Bild,
Alt, Detailpfad). `pages/index.vue` übersetzt sie in den vorhandenen
`EventSlide`-Typ aus `#layers/home` und stellt sie den redaktionellen
Slides voran. Weder `home` noch `events` kennen einander.

Alternative „`home`-Composable lädt Events selbst“ verworfen:
Boundary-Verletzung. Alternative „eigener Slide-Typ“ verworfen:
`CarouselItemEvent` stellt Titel, Zeitraum, Bild und Link bereits dar.

Die Obergrenze 2 ist eine benannte Konstante im Events-Layer.

### D7 – Statischer Navigationseintrag

`navItems.ts` erhält `{ type: 'link', textKey: 'navigation.events',
routeName: 'events', icon: ['fas', 'calendar-days'] }` hinter „Community
POI“. Keine Laufzeitlogik; `isCurrentNavPath` markiert Unterseiten bereits
per Präfix. Das Icon wird im FontAwesome-Plugin registriert
(`fontawesome-registry.spec.ts`).

### D8 – Sitemap über eine eigene Nitro-Quelle

`server/api/__sitemap__/events.ts` liest beide Sprach-Collections über
`queryCollection` aus `@nuxt/content/server`, wendet `eventPhaseAt(…, new
Date())` an und liefert Detail-URLs aller nicht verborgenen Events. Die
Übersicht `/<locale>/events` kommt als statische Seite ohnehin in die
Sitemap. Die Collection erhält **kein** `defineSitemapSchema`, damit sie
nicht zusätzlich und ohne Phasenfilter aufgenommen wird. Import von
`locales` und Boundary-Ausnahme nach dem Muster von `team.ts`.

Alternative `defineSitemapSchema` mit Filter verworfen: der Filter läuft beim
Build, nicht zur Anfragezeit, und würde angekündigte Events erst mit dem
nächsten Deploy aufnehmen.

### D9 – Komponentenschnitt: neutral in `base`, Event-Begriffe in `events`

```
layers/base/components/            layers/events/components/
  MediaGallery.vue   (aus POI)       EventCard.vue          (M3Card)
  ResourceList.vue   (aus POI,       EventPhaseChip.vue     (M3Chip, Kennz.)
     verallgemeinert)                EventAccessChip.vue    (M3Chip, Kennz.)
  DateRange.vue      (neu)           EventSection.vue       (SectionHeading
  EmptyState.vue     (neu)                                   + Raster/Leer)
                                     EventJoinBlock.vue     (M3Button, Liste)
                                     EventBuildDetails.vue
                                     EventPlayDetails.vue
                                     EventAdventureDetails.vue
                                     EventBetaDetails.vue
```

Faustregel: was keinen Event-Begriff kennt, gehört nach `base`. Alle Namen
sind präfixiert, damit `layer-name-collisions.spec.ts` grün bleibt.
`ResourceList` übernimmt die Schematic-Darstellung aus
`CommunityPoiSchematicList` als eine Art unter mehreren; POI-spezifische
Hilfe (`CommunityPoiLitematicaHelp`) bleibt im POI-Layer.

Die Extraktion passiert in dieser Change, weil Events der zweite Nutzer ist.
MD3-Task 10.1 ändert sich dadurch zu „POI auf `MediaGallery` umstellen“ bzw.
entfällt für die Galerie, je nachdem, welche Change zuerst landet.

### D10 – Strukturierte Daten schlicht

`useSchemaOrg([defineEvent({...})])` auf der Detailseite mit
`eventAttendanceMode: OnlineEventAttendanceMode`, `location:
VirtualLocation(url)`, `eventStatus: EventScheduled`, `organizer` = Site-
Organisation. Keine `offers`, kein `audience`: Google vergibt für reine
Online- und Mitgliedschafts-Events kein Rich Result (Stand der Doku
2026-09-08), und schema.org kennt keinen Wert für „nur auf Einladung“.

### D11 – Anleitungen als MDC-Blöcke mit progressiver Tab-Darstellung

Anleitungen stehen im Markdown-Text, nicht im Frontmatter: Spielmodus-
Anleitungen brauchen Bilder, Hervorhebungen und Listen, die YAML-Strings nicht
tragen. Syntax:

```md
::event-guides
:::event-guide{role="Survivor" icon="person-running"}
…
:::
:::event-guide{role="Slender" icon="ghost"}
…
:::
::
```

`@nuxt/content` löst Komponenten aller Layer im Markdown auf (wie die
`Prose*`-Overrides in `content-core`), daher genügen `EventGuides.vue` und
`EventGuide.vue` in `layers/events/components/`. Ein einzelnes
`::event-guide` ohne Wrapper erscheint als Abschnitt mit Überschrift.

`EventGuides` liest die Rollen aus den Props seiner Slot-Kinder. Server und
erster Client-Render zeigen alle Anleitungen untereinander, jede mit
Überschrift – lesbar ohne JavaScript und identisch für die Hydrierung. Erst
nach `onMounted` schaltet die Komponente auf Tabs um (ARIA `tablist`/`tab`/
`tabpanel`, Pfeiltasten, Roving Tabindex); per `provide` erfahren die Kinder,
dass ihre Überschrift jetzt der Tab ist. Alternative „Tabs schon im SSR“
verworfen: ohne JavaScript wären alle Rollen außer der ersten versteckt.

Die Rollen-Icons laufen über das FontAwesome-Registry (`fontawesome-registry.spec.ts`);
Icons aus Markdown sind Strings und werden dort nicht gefunden, deshalb
bildet `EventGuide` eine feste Liste erlaubter Namen auf registrierte Icons ab
und fällt sonst auf ein neutrales Symbol zurück.

### D12 – Ergebnis und Test-Block als eigene Komponenten

`EventResults` (Fazit, Platzierungen sortiert, Kennzahlen als `<dl>`,
„Wie geht es weiter“) erscheint nur bei `phase === 'past'`, direkt unter dem
Kopf; ohne `results` zeigt er „Ergebnisse folgen“. `EventTestingBlock`
(Schwerpunkte, bekannte Probleme, „Feedback melden“ nur außerhalb von
`past`) steht bei Betas im Detailbereich. Die Karte bekommt `winner` (Name
des Erstplatzierten) in `EventCardData`, nur für vergangene Events, damit die
Übersicht nicht das ganze Ergebnis in den Payload lädt.

## Risks / Trade-offs

- [Phasenwechsel bis ~1 h verzögert durch Edge-Cache] → akzeptiert und in der
  Spec über „beim Ausliefern frisch gerendert“ formuliert. Bei Bedarf später
  kürzere `routeRules` für `/*/events/**` und `/*`; nicht Teil dieser Change.
- [Startseite zeigt Event-Slide bis ~1 h nach `promote.until`] → wie oben.
- [Zugangsaktion kann im gecachten HTML noch aktiv sein, obwohl `closes`
  vorbei ist] → das Ziel (Formular) ist maßgeblich; der Hinweis nennt die
  Frist ausdrücklich.
- [`@nuxtjs/sitemap` nimmt die Collection ohne `defineSitemapSchema` doch
  automatisch auf] → erster Task prüft das am Build; sonst Ausschluss per
  `exclude`.
- [`shared/utils` wird von Nitro nicht wie erwartet auto-importiert] → erster
  Task baut die Sitemap-Route gegen eine Minimalversion und prüft `nuxi build`
  (AGENTS.md verlangt den echten Build bei neuen Grenzfällen).
- [POI-Regression durch Extraktion] → bestehende `poi-*`-Tests und Screenshots
  vor/nach; Extraktion als eigener Task vor den Event-Komponenten.
- [Abhängigkeit von MD3 Abschnitt 6 und 8] → Tasks sind so geordnet, dass
  Modell, Phasenlogik, Sitemap und `base`-Bausteine vorher umsetzbar sind;
  Karten und Carousel-Einbindung warten auf `M3Card` bzw. das migrierte
  Carousel.
- [Kaum Inhalte zum Start] → ein echtes vergangenes und ein Beispiel-Event je
  Sprache als Teil der Change; Leerzustand ist ohnehin spezifiziert.

## Migration Plan

1. Modell, Collection, Repository, Phasenlogik, Content-Test.
2. Sitemap-Route mit Build-Prüfung.
3. `base`-Bausteine extrahieren, POI umstellen (eigener, rückrollbarer
   Commit).
4. Events-Komponenten und Seiten (nach MD3 Abschnitt 6).
5. Navigation und Carousel-Einbindung (Carousel nach MD3 Abschnitt 8).
6. Inhalte.

Rückbau: Revert der Commits; es gibt keine Datenmigration. Ohne Inhalte unter
`content/events/` ist der Bereich bis auf Menüpunkt und Leerzustand inert.

## Open Questions

- Endgültiges Icon für den Menüpunkt (`calendar-days` als Vorschlag).
- Welche Rollen-Icons zusätzlich freigegeben werden – ändert nur die Liste in
  `EventGuide`.
