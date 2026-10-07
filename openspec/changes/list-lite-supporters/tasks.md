# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Alles ist ein einziger Pull Request unter `feat(community)`; Commits folgen
Conventional Commits (`feat(community): …`), Tests im selben Commit wie der Code,
den sie treiben. Tests folgen F.I.R.S.T.: feste Zeitpunkte, kein Netz (der Abruf
wird übergeben, Fixtures tragen Beträge und E-Mails, um deren Entfernung zu
belegen), kein Warten, jeder Test baut sein eigenes Fixture.

## 1. Server

- [ ] 1.1 `tests/community/lite-supporters.spec.ts` schreiben: `loadLiteSupporters` ruft `https://opencollective.com/<slug>/members/all.json` (Slug kodiert) mit Abbruchsignal und Cache-Optionen auf; behält nur aktive `BACKER`; schließt Kollektiv (Name, Profil), „Guest“/„Incognito“ und Nicht-OpenCollective-Profile aus; entdoppelt nach Profil; sortiert alphabetisch ohne Beachtung der Schreibweise; liefert nur `name`, `image`, `profile` (Fixture mit `totalAmountDonated`, `email`, `lastTransactionAt`, `github`); `image` nur von OpenCollective-Hosts, sonst `null`; wirft bei Status ≠ 2xx, Nicht-Array und Abrufsfehler; `tests/architecture/supporters-cache.spec.ts`: Route nutzt `defineCachedFunction`, `swr: false`, `supporters: []`; rot sehen; verifiziert durch `pnpm exec vitest run tests/community/lite-supporters.spec.ts tests/architecture/supporters-cache.spec.ts`
- [ ] 1.2 `shared/utils/liteSupporters.ts`, Typ `LiteSupporter` in `layers/opencollective/types.ts` und `server/api/community/supporters.get.ts` umsetzen; verifiziert durch grüne Tests aus 1.1
- [ ] 1.3 `layers/opencollective/composables/useLiteSupporters.ts` mit Test (`// @vitest-environment nuxt`: Liste durchgereicht; Fehler ergibt leere Liste, kein Wurf); verifiziert durch `pnpm exec vitest run tests/community`

## 2. Wand und Zahlen

- [ ] 2.1 `tests/community/anchor.spec.ts` und `tests/community/contributors.spec.ts` erweitern: `personAnchor` (Kleinschreibung, Akzente, Leerzeichen, Sonderzeichen, leer); Unterstützer werden Mitwirkende mit Abzeichen `supporter`; Zusammenführung mit `mcName` und `name` ohne Beachtung der Schreibweise („Blndr2“ ↔ `blndr2`) zu einer Karte mit zwei Abzeichen; Anker aus dem Unterstützernamen; Bild durchgereicht; Zahl der Mitwirkenden schließt Unterstützer ein; rot sehen
- [ ] 2.2 `shared/utils/personAnchor.ts` und `buildCommunityOverview` (Eingabe `supporters`, Typen `Contribution`, `Contributor.anchor/avatarUrl`) umsetzen; verifiziert durch grüne Tests aus 2.1
- [ ] 2.3 `tests/community/components.spec.ts` erweitern: Karte trägt `id` aus dem Anker; Abzeichen „Unterstützer“ ist ein Link auf das Profil; Avatar-Reihenfolge (Kopf bei `mcName`, Bild, Platzhalter); `tests/community/overview-composable.spec.ts` erweitern: Liste fließt in Wand und Zahl, Kachel „Unterstützer“ = Listenlänge, Rückfall auf OpenCollective bei leerer Liste; rot sehen
- [ ] 2.4 `CommunityWall.vue`, `useCommunityOverview.ts`, `image.domains` in `nuxt.config.ts` und Texte `community.wall.badge_supporter` in `i18n/locales/{de,en}.json` umsetzen; verifiziert durch grüne Tests aus 2.3 und `pnpm exec vitest run tests/i18n tests/design-system tests/a11y tests/architecture`

## 3. Team-Seite

- [ ] 3.1 `tests/team/supporter-list.spec.ts` (`// @vitest-environment nuxt`) schreiben: `TeamSupporterList` rendert `h3`, `ul` mit je einem `li` je Person, Link auf `href`, dekorativen Avatar (`alt=""`), Platzhalter ohne Bild, nichts bei leerer Liste; Seitenquelle: `pages/team/index.vue` setzt die Liste nur im Lite-Rang ein; rot sehen
- [ ] 3.2 `TeamSupporterList.vue`, Slot in `TeamRankSection.vue`, `pages/team/index.vue` und ein Wurzel-Composable für die Links (`/<locale>/community#<anker>`) umsetzen; Texte `team.supporters.*` in `i18n/locales/{de,en}.json`; verifiziert durch grüne Tests aus 3.1 und `pnpm exec vitest run tests/architecture tests/seo tests/a11y tests/i18n`

## 4. Gesamtprüfung

- [ ] 4.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [ ] 4.2 `pnpm preview`: `/de/team` listet die Unterstützer mit Links auf `/de/community#person-…`; `/de/community` zeigt sie mit Abzeichen und Ankern, „Blndr2“ als eine Karte mit zwei Abzeichen; im HTML und in der Payload kein `totalAmountDonated`, keine E-Mail-Adresse, kein `lastTransaction`; mit ungültigem Slug (`NUXT_PUBLIC_OPEN_COLLECTIVE_SLUG`) antworten beide Seiten mit 200 ohne Liste

## 5. Pull Request

- [ ] 5.1 Pull Request mit dem Titel `feat(community): list lite supporters on the team page and community wall` öffnen (Beschreibung auf Englisch: Datenquelle, Datenschutz, Querverweise, Zusammenführung, Zahlen, Belege aus 4.2)
