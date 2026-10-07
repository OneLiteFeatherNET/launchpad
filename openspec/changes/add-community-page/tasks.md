# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Alles ist ein einziger Pull Request unter `feat(community)`; Commits
folgen Conventional Commits (`feat(community): …`), Tests im selben Commit wie
der Code, den sie treiben. Tests folgen F.I.R.S.T.: feste Zeitpunkte statt
Systemzeit, kein Netz (der Abruf wird übergeben), kein Warten, jeder Test baut
sein eigenes Fixture.

## 1. Layer und Aggregation

- [x] 1.1 `tests/community/contributors.spec.ts` schreiben: `buildCommunityOverview` führt Bauherren zweier POIs mit gleichem `mcName` (verschiedene Schreibweise) zu einer Person mit zwei Abzeichen zusammen, fällt ohne `mcName` auf den Namen zurück, zählt Platzierungen nur bei gelisteten, vergangenen Events (verborgen, `unlisted`, laufend, angekündigt: keine Person), liefert `teamSize` und `buildCount` durch, sortiert nach Beiträgen absteigend dann nach Namen, nimmt den Anzeigenamen des ersten Beitrags, baut Pfade `/<locale>/community-poi/<slug>` und `/<locale>/events/<slug>`, trägt weder `results` noch Pfadfelder der Quelle im Ergebnis; rot sehen; verifiziert durch `pnpm exec vitest run tests/community/contributors.spec.ts`
- [x] 1.2 `layers/community/{nuxt.config.ts,index.ts,types.ts}` und `layers/community/utils/contributors.ts` umsetzen (Typen `Contributor`, `Contribution`, `CommunityOverview` und die Quelltypen; Wertexport nur die reine Funktion, nur Typimporte plus `#shared/utils/eventPhase` und `eventRoutes`); verifiziert durch grüne Tests aus 1.1 und `pnpm exec vitest run tests/architecture`

## 2. Discord-Mitgliederzahl

- [x] 2.1 `tests/community/discord-invite.spec.ts` schreiben: `loadDiscordMemberCount` ruft `https://discord.com/api/v10/invites/<code>?with_counts=true` auf (Code URL-kodiert), liefert `approximate_member_count`, wirft bei Status ≠ 2xx, bei fehlendem oder nicht numerischem Feld und bei Fehler des Abrufs, übergibt ein Abbruchsignal; `tests/architecture/discord-cache.spec.ts`: die Route nutzt `defineCachedFunction`, `swr: false`, und die Composable ruft nur `/api/community/discord`; rot sehen; verifiziert durch `pnpm exec vitest run tests/community/discord-invite.spec.ts tests/architecture/discord-cache.spec.ts`
- [x] 2.2 `shared/utils/discordInvite.ts` (oberste Ebene), `server/api/community/discord.get.ts` und `runtimeConfig.discordInviteCode: 'yzkf2H9UQD'` in `nuxt.config.ts` umsetzen; die Route fängt Fehler zu `{ members: null }`; verifiziert durch grüne Tests aus 2.1
- [x] 2.3 `layers/community/composables/useDiscordMembers.ts` mit Test (`// @vitest-environment nuxt`, `$fetch` per `mockNuxtImport` ersetzt: Zahl durchgereicht; Fehler ergibt `null`, kein Wurf); verifiziert durch `pnpm exec vitest run tests/community`

## 3. Komponenten

- [x] 3.1 `tests/community/components.spec.ts` (`// @vitest-environment nuxt`) schreiben: `CommunityStats` zeigt eine `dl` mit je Beschriftung und Wert, lässt die Discord-Kachel bei `null` weg und die Unterstützer-Kachel bei `null`; `CommunityWall` zeigt eine `ul` mit einem `li` je Person, Kopf mit leerem `alt`, je Beitrag einen Link auf den Pfad, nennt „1. Platz“ beim Event-Abzeichen, rendert nichts bei leerer Liste; `CommunityStrip` verlinkt auf `/de/community`; rot sehen; verifiziert durch `pnpm exec vitest run tests/community/components.spec.ts`
- [x] 3.2 `CommunityStats.vue`, `CommunityWall.vue`, `CommunityStrip.vue` mit M3-Bausteinen und Tokens umsetzen, Texte in `i18n/locales/{de,en}.json` unter `community.*`; verifiziert durch grüne Tests aus 3.1, `pnpm exec vitest run tests/i18n tests/design-system tests/a11y`

## 4. Orchestrierung, Seite, Navigation

- [x] 4.1 `tests/community/overview-composable.spec.ts` (`// @vitest-environment nuxt`, `useContentRepository` per `mockNuxtImport` mit fester Attrappe; Events mit Daten weit in der Vergangenheit, damit die Uhr des Composables das Ergebnis nicht beeinflusst): `useCommunityOverview` verknüpft POIs, Events und Teamgröße (ohne `openPosition`), fragt die Sprache der Seite ab; rot sehen
- [x] 4.2 `composables/useCommunityOverview.ts` umsetzen; verifiziert durch grüne Tests aus 4.1
- [x] 4.3 `tests/community/page.spec.ts` schreiben (liest die Quelle): die Seite hat einen `h1`, ruft `usePageSeo` mit Titel und `CollectionPage`, `useBreadcrumbs`, setzt die Wand nur bei vorhandenen Mitwirkenden ein, liest keine Query; die Startseite setzt `CommunityStrip` mit Props; `navConfig` enthält `routeName: 'community'` vor dem Block `more`; rot sehen
- [x] 4.4 `pages/community.vue`, Zahlenstreifen in `pages/index.vue` (nach dem Karussell, Daten auf Seitenebene, Komponente per `LazyCommunityStrip hydrate-on-visible`) und Eintrag in `layers/navigation/navItems.ts` umsetzen; `navigation.community` in `i18n/locales/{de,en}.json`; verifiziert durch grüne Tests aus 4.3 und `pnpm exec vitest run tests/architecture tests/seo tests/a11y tests/i18n`
- [x] 4.5 `AGENTS.md`: `community` in die Layer-Liste aufnehmen; verifiziert durch Durchsicht

## 5. Gesamtprüfung

- [x] 5.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [x] 5.2 `pnpm preview`: `/de/community` und `/en/community` antworten mit 200, genau ein Canonical ohne Schrägstrich, hreflang, Zahlen und Wand mit den Namen der Bauherren; `/de` trägt den Streifen; die Sitemap listet beide Seiten; `/api/community/discord` liefert eine Zahl; mit ungültigem `NUXT_DISCORD_INVITE_CODE` rendert die Seite weiter ohne Discord-Kachel

## 6. Pull Request

- [ ] 6.1 Pull Request mit dem Titel `feat(community): add a community page with stats and contributor wall` öffnen (Beschreibung auf Englisch: Zusammenfassung, Begründung, Belege aus 5.2)
