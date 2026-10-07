# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Alles ist ein einziger Pull Request unter `feat(content)`; Commits
folgen Conventional Commits (`feat(content): …`, bei Bedarf `feat(blog)`,
`feat(team)`, `feat(events)`), Tests im selben Commit wie der Code, den sie
treiben. Tests folgen F.I.R.S.T.: feste Zeitpunkte statt Systemzeit, kein
Warten, jeder Test baut sein eigenes Fixture.

Die offenen Fragen 1 bis 4 in `design.md` sind entschieden.

## 1. Resolver in content-core

- [x] 1.1 `tests/content-core/person.spec.ts` schreiben: `resolvePersonFrom` liefert für einen Roster-Slug `kind: 'team'` und `profilePath` `/de/team/<slug>`, für einen externen Slug `kind: 'external'` und `/de/blog/author/<slug>`, bei Kollision das Team-Mitglied, bei unbekanntem Slug `null` ohne Wurf, ignoriert `openPosition`-Einträge; rot sehen; verifiziert durch `pnpm exec vitest run tests/content-core/person.spec.ts`
- [x] 1.2 `layers/content-core/utils/content/person.ts` (reine Funktion und Typ `Person`, nur Typimporte) umsetzen; verifiziert durch grüne Tests aus 1.1
- [x] 1.3 `teamAvatarUrl` und `mcUsernameOf` von `layers/team/utils/teamAvatar.ts` nach `layers/content-core/utils/teamAvatar.ts` verschieben (offene Frage 3); `layers/team` importiert sie von dort, bestehende Tests mitziehen; verifiziert durch `pnpm exec vitest run tests/architecture`
- [x] 1.4 `usePeople(slugs)` und `resolvePerson(slug, locale)` in `layers/content-core/composables/` mit `useContentRepository()` (`getTeamDocument`, `listAuthorsBySlugs`); Composable-Test im `nuxt`-Umfeld mit `mockNuxtImport('useContentRepository', …)` und fester Repository-Attrappe; verifiziert durch `pnpm exec vitest run tests/content-core`
- [x] 1.5 `layers/content-core/index.ts` um die Wertexporte und `export type { Person }` ergänzen; verifiziert durch `pnpm exec vitest run tests/architecture` und `pnpm build` (Client-Bundle-Regel aus AGENTS.md)

## 2. Schema und Inhaltsprüfung

- [x] 2.1 `tests/content/person-slugs.spec.ts` schreiben: (a) kein Slug in `content/team/*/home.json` und `content/authors/*.md` zugleich, (b) jeder `author` in `content/blog/*/*.md` löst in seiner Sprache auf, (c) jeder `hosts`-Slug in `content/events/*/*.md` löst auf (Datei fehlt heute: Test bleibt grün, Fixture-Fälle decken die Regel ab); Meldungen nennen Datei, Feld und Slug; Regeln als reine, exportierte Funktion mit Fixture-Fällen; rot sehen (der Blog-Fall (b) wird erst in 3 grün, weil `phillipp-glanz` und `themeinerlp` heute verschieden sind: Test vorerst nur mit Fixtures laufen lassen, den Dateifall zusammen mit 3.1 aktivieren)
- [x] 2.2 `tests/content/events-frontmatter.spec.ts` um `hosts` ergänzen (Liste von Strings, keine Duplikate, abweichende `hosts` bei gleichem `translationKey` abgelehnt; diese Übersetzungsregel liegt allein hier, nicht in 2.1); rot sehen; verifiziert durch `pnpm exec vitest run tests/content/events-frontmatter.spec.ts`
- [x] 2.3 `hosts: z.array(z.string()).optional()` in `eventsSchema` und den Kommentar an `blog.author` in `content.config.ts` anpassen (Slug aus Roster oder externen Autoren); Prüfregeln aus 2.1 und 2.2 umsetzen; verifiziert durch `pnpm exec vitest run tests/content` inklusive `tests/content/schema-columns.spec.ts`
- [x] 2.4 `EventDocument`/`EventSummary` in `layers/content-core/utils/content/repository.ts` und `layers/events/types.ts` um `hosts?: string[]` erweitern (Summary-Projektion in `nuxtContentAdapter.ts` prüfen, `tests/content/blog-list-projection.spec.ts` als Vorbild); verifiziert durch `pnpm typecheck` und `tests/content/adapter-queries.spec.ts`

## 3. Inhalt migrieren (eigener Commit)

- [x] 3.1 In allen 15 Dateien `content/blog/{de,en}/*.md` `author: phillipp-glanz` durch `author: themeinerlp` ersetzen; `content/authors/phillipp-glanz.md` löschen; `schemaOrg.author` unangetastet lassen (offene Frage 4); Commit `feat(content): migrate blog authors to team slugs`; verifiziert durch `pnpm exec vitest run tests/content` inklusive aktiviertem Dateifall aus 2.1(a) und (b) und `tests/content/orphaned-files.spec.ts`
- [x] 3.2 `tests/content/blog-authors-query.spec.ts` und weitere Tests, die `phillipp-glanz` nennen (`grep -rn phillipp-glanz tests/`), anpassen; verifiziert durch `pnpm test`

## 4. Blog: Byline, Karte, Autorenseite

- [x] 4.1 `useBlogArticle` in `layers/blog/composables/useBlogContent.ts` auf die Auflösung über `usePeople` umstellen; `tests/content/blog-authors-query.spec.ts` um Fälle ergänzen (Team-Autor mit `profilePath`, externer Autor, unbekannter Slug wird übergangen, Reihenfolge nach Frontmatter); rot, dann grün; verifiziert durch `pnpm exec vitest run tests/content/blog-authors-query.spec.ts`
- [x] 4.2 `PersonLink` in `layers/base/components/` (strukturelle Props, kein Fach-Layer-Import) mit Komponententest (`happy-dom`): Name als `NuxtLink` auf `to`, optional Avatar und Rolle; verifiziert durch `pnpm exec vitest run tests/architecture/layer-name-collisions.spec.ts tests/design-system`
- [x] 4.3 Byline in `pages/blog/[...slug].vue` auf `PersonLink` umstellen; verifiziert durch `pnpm exec vitest run tests/a11y/heading-structure.spec.ts`
- [x] 4.4 `ArticleCard` und `Top1` (`layers/blog/components/`) erhalten die Autoren als Prop und zeigen sie mit `PersonLink` über dem gestreckten Kartenlink (kein verschachteltes `<a>`); Komponententest für beide Autorenarten; `pages/blog/index.vue` löst alle Slugs einer Übersicht mit einer `usePeople`-Abfrage auf; verifiziert durch den Komponententest und `pnpm exec vitest run tests/a11y`
- [x] 4.5 `tests/shared/blogAuthors.spec.ts` schreiben: reine Funktionen in `shared/utils/blogAuthors.ts` filtern Artikel nach Autor (String und Liste), wenden die Freigaberegel mit festem `now` an (nicht freigegebener Artikel fehlt) und liefern die Autoren-Slugs freigegebener Artikel; rot sehen. Dann umsetzen (oberste Ebene von `shared/utils`, ohne Vue/H3) und `isReleased` aus `layers/blog/composables/useBlogContent.ts` dorthin verlegen; verifiziert durch `pnpm exec vitest run tests/shared tests/content/blog-authors-query.spec.ts`
- [x] 4.6 Route `pages/blog/author/[slug].vue` und `useBlogPostsByAuthor(slug)` (`layers/blog/composables/`): Artikel per 4.5 filtern, Person mit `usePeople` auflösen, nach dem `await` `createError({ statusCode: 404, fatal: true })`, wenn keine Person oder keine freigegebene Artikel; Sprach-Slugs über `useSetI18nParams` für Sprachen mit Artikeln; `usePageSeo` ohne `canonical`-Override; kein `route.query`. Test `tests/blog/author-page.spec.ts` (`nuxt`-Umfeld, `mockNuxtImport('useContentRepository', …)`, feste Attrappe): 404 für unbekannten Slug, 404 für Person ohne Artikel, Treffer für Team- und externen Autor; rot, dann grün; verifiziert durch `pnpm exec vitest run tests/blog tests/architecture/request-independent-render.spec.ts` (Architekturtest unverändert grün, keine Ausnahme)
- [x] 4.7 `tests/content/blog-author-path.spec.ts`: kein Blogartikel (`content/blog/*/*.md`) hat den Slug `author`; Fixture-Fall schlägt mit Dateinamen fehl; verifiziert durch `pnpm exec vitest run tests/content/blog-author-path.spec.ts`
- [x] 4.8 `AuthorBox` in `layers/blog/components/` (Avatar, Name, Rolle, Bio, Links über `toSafeExternalUrl`; bei Team-Autor Link auf das Profil statt Bio) mit Komponententest; verifiziert durch `pnpm exec vitest run tests/blog tests/a11y`
- [x] 4.9 Sitemap-Quelle `server/api/__sitemap__/blog-authors.ts` nach dem Muster von `team.ts` (Locale-Liste aus `~/layers/content-core/utils/content/locales`, Regeln aus `shared/utils/blogAuthors.ts`, ein Eintrag je Sprache × Autor mit freigegebenem Artikel), in `nuxt.config.ts` neben `team` und `events` eintragen, benannte Ausnahme in `tests/architecture/module-boundaries.spec.ts` registrieren; Test der Eintragsliste in `tests/shared/blogAuthors.spec.ts`; verifiziert durch `pnpm exec vitest run tests/architecture tests/seo/robots-sitemap.spec.ts` und `pnpm build`
- [x] 4.10 Neue Texte in `i18n/locales/de.json` und `en.json` (`blog.author.*`: Kasten, „Beiträge von“, Link „Zum Profil“, Seitentitel und -beschreibung); verifiziert durch `pnpm exec vitest run tests/i18n`

## 5. Team-Profil: Beiträge und Events

- [x] 5.1 `tests/shared/blogAuthors.spec.ts` (aus 4.5) um die Profil-Beiträge erweitern: die reinen Funktionen liefern freigegebene Artikel mit Slug in `author` (String und Liste), neueste zuerst, ohne zukünftige `releaseDate`, mit festem `now`; rot sehen. Keine zweite Filterfunktion: 4.5 und `useBlogPostsByAuthor` aus 4.6 werden wiederverwendet
- [x] 5.2 `AuthorPostList` in `layers/blog/components/` (Titel als Link, Veröffentlichungsdatum) mit Komponententest; sie nutzt `useBlogPostsByAuthor` aus 4.6; verifiziert durch `pnpm exec vitest run tests/shared tests/blog`
- [x] 5.3 `tests/events/events-by-host.spec.ts`: reine Funktion in `layers/events/utils/eventLists.ts` liefert gelistete Events mit Slug in `hosts` je Phase, schließt `unlisted` und verborgene Events aus, mit festem `now`; rot sehen
- [x] 5.4 `useEventsByHost(slug)` in `layers/events/composables/useEvents.ts` (Phase im `useAsyncData`-Handler, in der Nutzlast übertragen) und `HostedEventList` in `layers/events/components/` umsetzen; verifiziert durch grüne Tests aus 5.3 und `tests/events/phase-on-server.spec.ts`
- [x] 5.5 `pages/team/[slug].vue` setzt `AuthorPostList` und `HostedEventList` zusammen, beide nur bei Treffern; `layers/team` bleibt unverändert; i18n `team.profile.posts` und `team.profile.events` in `de` und `en`; verifiziert durch `pnpm exec vitest run tests/architecture tests/seo/team-thin-profiles.spec.ts tests/i18n` (Hinweis: `isThinTeamProfile` zählt Beiträge nicht mit; ob ein Profil mit Beiträgen nicht mehr als dünn gilt, ist ein eigener Entscheid und wird hier nicht geändert)

## 6. Events: Gastgeber

- [ ] 6.1 `tests/events/event-detail.spec.ts` um Fälle ergänzen: `hosts` werden zu Personen mit `profilePath` aufgelöst, in Frontmatter-Reihenfolge, nicht auflösbarer Slug wird übergangen, ohne `hosts` bleibt die Liste leer; rot sehen
- [ ] 6.2 `useEventDetail` in `layers/events/composables/useEvents.ts` löst `hosts` mit `usePeople` im Daten-Handler auf (Teil von `EventDetail`); verifiziert durch grüne Tests aus 6.1
- [ ] 6.3 `pages/events/[...slug].vue` zeigt den Abschnitt „Gastgeber“ mit `PersonLink` (nur bei Treffern); die Platzierungen in `EventResults.vue` bleiben unverlinkt, abgesichert durch einen Fall in `tests/events/event-results-guides.spec.ts`; i18n `events.hosts` in `de` und `en`; verifiziert durch `pnpm exec vitest run tests/events tests/i18n`

## 7. `teamMembers` entfernen

- [ ] 7.1 Nach Entscheidung zu offener Frage 1: `teamMembers` aus `content.config.ts` (Zeile ~27) und `repository.ts` (Zeile ~256), `layers/blog/components/FeaturedTeamMembers.vue`, den Block und die `useTeamRoster`-Nutzung in `pages/blog/[...slug].vue`, den Schlüssel `blog.featured_team` in `de.json` und `en.json` sowie den Test „blog names nothing from the team domain“ in `tests/architecture/module-boundaries.spec.ts` entfernen; `tests/architecture/unused-components.spec.ts` und `tests/content/schema-columns.spec.ts` anpassen; verifiziert durch `pnpm exec vitest run tests/architecture tests/content tests/i18n` und `pnpm typecheck`

## 8. Abschluss

- [ ] 8.1 `pnpm test` läuft grün, inklusive `tests/architecture/` (Layer-Grenzen, `request-independent-render`, Namenskollisionen)
- [ ] 8.2 `pnpm typecheck` und `pnpm quality` laufen; die Zahlen in `quality-baseline.json` steigen nicht (nicht anheben, notfalls Befund beheben)
- [ ] 8.3 `pnpm build` läuft grün (der neue Wertexport in `layers/content-core/index.ts` darf den Client-Build nicht brechen)
- [ ] 8.4 In `pnpm preview` unter `http://localhost:8788` prüfen: `/de/blog` (Autor auf Karten), `/de/blog/author/themeinerlp` (Liste, Kasten, genau ein Canonical auf sich selbst und je Sprache ein Alternate per View-Source, Sprachwechsel), `/de/blog/author/niemand` (404), Eintrag in `/api/__sitemap__/blog-authors`, Artikel-Byline mit Link, `/de/team/themeinerlp` (Abschnitt „Beiträge“, „Events“ nur bei Inhalt), ein temporäres Event mit `hosts` (nicht committen); keine Hydration-Warnung in der Konsole
- [ ] 8.5 `.nuxtrc`-Änderungen aus dem `nuxt`-Testumfeld nicht committen
- [ ] 8.6 Pull Request gegen `main` mit dem Titel `feat(content): cross-link authors and hosts with team profiles` öffnen (englische Beschreibung: Zusammenfassung, Begründung, Hinweis auf die Entscheidungen zu offenen Fragen 1 bis 3, Screenshot von Autorenkasten und Team-Profil, Hinweis, dass `add-events-section` und `add-unlisted-events` vorher archiviert sein müssen)
