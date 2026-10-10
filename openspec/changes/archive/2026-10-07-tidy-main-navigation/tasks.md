# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Alles ist ein einziger Pull Request unter `feat(navigation)`; Commits
folgen Conventional Commits (`feat(navigation): …`), Tests im selben Commit wie
der Code, den sie treiben. Tests folgen F.I.R.S.T.: keine Uhr, kein Netz, kein
Warten, jeder Test baut sein eigenes Fixture.

## 1. Struktur

- [x] 1.1 `tests/navigation/structure.spec.ts` schreiben: oberste Ebene von `navConfig` hat höchstens sechs Einträge und genau die Reihenfolge Team, Blog, Community, Mehr; kein Eintrag mit `routeName: 'index'` ohne Hash auf oberster Ebene; die Gruppen enthalten die in der Spezifikation genannten Kinder; die Menge aller Ziele (plus Logo-Link auf `/`) deckt Startseite, blog, team, community-poi, events, projects, community, `#connect`, bluemap und Status ab; i18n de und en tragen `navigation.builds` („Bauwerke“/„Builds“), `navigation.home_link` und `navigation.community_overview`; rot sehen; verifiziert durch `pnpm exec vitest run tests/navigation`
- [x] 1.2 `navItems.ts` und `i18n/locales/{de,en}.json` umbauen (`navigation.overview` und `navigation.community_poi` entfallen); `tests/community/page.spec.ts` und `tests/projects/pages.spec.ts` an die Gruppe anpassen; verifiziert durch grüne Tests aus 1.1 und `pnpm exec vitest run tests/community tests/projects tests/i18n`

## 2. Aktivzustand der Gruppen

- [x] 2.1 `tests/architecture/nav-active-state.spec.ts` erweitern: `isNavGroupActive` ist wahr auf einem Kind und dessen Unterseite, falsch für Ankerpfade (`/de#connect`), externe Ziele und Geschwister mit gleichem Präfix; `NavigationBar.vue` ruft die Funktion für den Gruppenknopf auf (Desktop und mobil); rot sehen
- [x] 2.2 `isNavGroupActive` in `utils/navigation.ts` umsetzen und in `NavigationBar.vue` verwenden; verifiziert durch grüne Tests aus 2.1

## 3. Leiste, Logo, Discord, Zugänglichkeit

- [x] 3.1 `tests/navigation/bar.spec.ts` schreiben (liest die Quelle): Logo-Link trägt `navigation.home_link` und `shrink-0`/`whitespace-nowrap`; Gruppenknopf trägt `aria-expanded` und `aria-controls`, das Menü die passende `id`; Discord erscheint auf dem Desktop als `M3Button`; `NAV_ITEM_DESKTOP` enthält `whitespace-nowrap`; `tests/navigation/structure.spec.ts` prüft, dass `navigation.home_link` den sichtbaren Text „OneLiteFeather“ enthält; rot sehen
- [x] 3.2 `NavigationBar.vue` und `navItemClasses.ts` umsetzen, Discord-Button und `aria-controls`; verifiziert durch grüne Tests aus 3.1 und `pnpm exec vitest run tests/a11y tests/design-system tests/i18n`

## 4. Schema.org

- [x] 4.1 Test ergänzen, dass `useSiteNavigationSchema` ausschließlich aus `navConfig` liest und keine Beschriftung festschreibt (die neue Struktur fließt damit ein); falls rot, Composable anpassen; verifiziert durch `pnpm exec vitest run tests/navigation tests/seo`

## 5. Spielen-Button, Events automatisch, mobile Gruppenköpfe

- [x] 5.1 Tests schreiben (rot sehen): `tests/navigation/structure.spec.ts` für `buildNavConfig` mit beiden Werten (Reihenfolge, höchstens sechs Einträge oberster Ebene, alle Ziele erreichbar inklusive `playLink` mit `#connect`, Events-Aktivzustand als Link und über die Gruppe, „Mehr“ ohne „Server verbinden“, `navigation.play` de „Spielen“ und en „Play“); `tests/navigation/live-events.spec.ts` für `hasLiveListedEventAt` mit festem `now` (laufend, angekündigt: ja; verborgen, vergangen, `unlisted`: nein); `tests/navigation/events-in-nav.spec.ts` (nuxt-Umgebung, feste Uhr, Repository-Attrappe); `tests/content/adapter-queries.spec.ts` (`listEventSchedules` wählt nur `unlisted` und `event`); `tests/navigation/bar.spec.ts` (gefüllter Spielen-Button vor tonalem Discord, beide mobil, Gruppenkopf mit `NAV_ITEM_MOBILE`, Eigenschaft `eventsTopLevel`, Layout reicht sie weiter)
- [x] 5.2 `buildNavConfig`/`playLink`, `hasLiveListedEventAt`, `listEventSchedules`, `useEventsInNav`, Layout, `NavigationBar.vue` (Buttons, Eigenschaft, mobile Gruppenköpfe) und `useSiteNavigationSchema` umsetzen; i18n anpassen; verifiziert durch grüne Tests aus 5.1 und `pnpm exec vitest run tests/navigation tests/content tests/architecture tests/i18n`

## 6. Gesamtprüfung

- [x] 6.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün (typecheck: die drei Fehler der Baseline in Dateien außerhalb der Navigation bleiben unverändert)
- [x] 6.2 `pnpm preview`: `/de` und `/en` zeigen Team, Blog, Community, Mehr in dieser Reihenfolge (mit einem vorübergehenden kommenden Event: Team, Blog, Events, Community, Mehr), vor der Sprachwahl Spielen und Discord, die Gruppen enthalten ihre Kinder, kein Link „Übersicht“ auf oberster Ebene, das Logo führt auf `/de`; Screenshots bei 1480, 1280, 1024 und 390 px Breite ohne Umbruch und ohne Abschneiden

## 7. Pull Request

- [x] 7.1 Pull Request mit dem Titel `feat(navigation): group the main navigation under team, blog, community and more` öffnen (englischer Text, Zusammenfassung, Screenshots)
