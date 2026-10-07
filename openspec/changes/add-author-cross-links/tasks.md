# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Alles ist ein einziger Pull Request unter `feat(content)`; Commits
folgen Conventional Commits (`feat(content): …`, bei Bedarf `feat(blog)`,
`feat(team)`, `feat(events)`), Tests im selben Commit wie der Code, den sie
treiben. Tests folgen F.I.R.S.T.: feste Zeitpunkte statt Systemzeit, kein
Warten, jeder Test baut sein eigenes Fixture.

Vor Beginn: Offene Fragen 1 bis 3 in `design.md` entscheiden lassen.

## 1. Resolver in content-core

- [ ] 1.1 `tests/content-core/person.spec.ts` schreiben: `resolvePersonFrom` liefert für einen Roster-Slug `kind: 'team'` und `profilePath` `/de/team/<slug>`, für einen externen Slug `kind: 'external'` und `/de/blog?author=<slug>`, bei Kollision das Team-Mitglied, bei unbekanntem Slug `null` ohne Wurf, ignoriert `openPosition`-Einträge; rot sehen; verifiziert durch `pnpm exec vitest run tests/content-core/person.spec.ts`
- [ ] 1.2 `layers/content-core/utils/content/person.ts` (reine Funktion und Typ `Person`, nur Typimporte) umsetzen; verifiziert durch grüne Tests aus 1.1
- [ ] 1.3 Avatar-Helfer für Team-Mitglieder nach Entscheidung zu offener Frage 3 aus `layers/team/utils/teamAvatar.ts` zugänglich machen (bestehende Tests unter `tests/` mitziehen); verifiziert durch `pnpm exec vitest run tests/architecture`
- [ ] 1.4 `usePeople(slugs)` und `resolvePerson(slug, locale)` in `layers/content-core/composables/` mit `useContentRepository()` (`getTeamDocument`, `listAuthorsBySlugs`); Composable-Test im `nuxt`-Umfeld mit `mockNuxtImport('useContentRepository', …)` und fester Repository-Attrappe; verifiziert durch `pnpm exec vitest run tests/content-core`
- [ ] 1.5 `layers/content-core/index.ts` um die Wertexporte und `export type { Person }` ergänzen; verifiziert durch `pnpm exec vitest run tests/architecture` und `pnpm build` (Client-Bundle-Regel aus AGENTS.md)

## 2. Schema und Inhaltsprüfung

- [ ] 2.1 `tests/content/person-slugs.spec.ts` schreiben: (a) kein Slug in `content/team/*/home.json` und `content/authors/*.md` zugleich, (b) jeder `author` in `content/blog/*/*.md` löst in seiner Sprache auf, (c) jeder `hosts`-Slug in `content/events/*/*.md` löst auf (Datei fehlt heute: Test bleibt grün, Fixture-Fälle decken die Regel ab), (d) Übersetzungen mit gleichem `translationKey` tragen gleiche `hosts`; Meldungen nennen Datei, Feld und Slug; Regeln als reine, exportierte Funktion mit Fixture-Fällen; rot sehen (der Blog-Fall (b) wird erst in 3 grün, weil `phillipp-glanz` und `themeinerlp` heute verschieden sind: Test vorerst nur mit Fixtures laufen lassen, den Dateifall zusammen mit 3.1 aktivieren)
- [ ] 2.2 `tests/content/events-frontmatter.spec.ts` um `hosts` ergänzen (Liste von Strings, keine Duplikate, abweichende `hosts` bei gleichem `translationKey` abgelehnt); rot sehen; verifiziert durch `pnpm exec vitest run tests/content/events-frontmatter.spec.ts`
- [ ] 2.3 `hosts: z.array(z.string()).optional()` in `eventsSchema` und den Kommentar an `blog.author` in `content.config.ts` anpassen (Slug aus Roster oder externen Autoren); Prüfregeln aus 2.1 und 2.2 umsetzen; verifiziert durch `pnpm exec vitest run tests/content` inklusive `tests/content/schema-columns.spec.ts`
- [ ] 2.4 `EventDocument`/`EventSummary` in `layers/content-core/utils/content/repository.ts` und `layers/events/types.ts` um `hosts?: string[]` erweitern (Summary-Projektion in `nuxtContentAdapter.ts` prüfen, `tests/content/blog-list-projection.spec.ts` als Vorbild); verifiziert durch `pnpm typecheck` und `tests/content/adapter-queries.spec.ts`

## 3. Inhalt migrieren (eigener Commit)

- [ ] 3.1 In allen 15 Dateien `content/blog/{de,en}/*.md` `author: phillipp-glanz` durch `author: themeinerlp` ersetzen; `content/authors/phillipp-glanz.md` löschen; `schemaOrg.author` unangetastet lassen (offene Frage 4); Commit `feat(content): migrate blog authors to team slugs`; verifiziert durch `pnpm exec vitest run tests/content` inklusive aktiviertem Dateifall aus 2.1(a) und (b) und `tests/content/orphaned-files.spec.ts`
- [ ] 3.2 `tests/content/blog-authors-query.spec.ts` und weitere Tests, die `phillipp-glanz` nennen (`grep -rn phillipp-glanz tests/`), anpassen; verifiziert durch `pnpm test`

## 4. Blog: Byline, Karte, Filter

- [ ] 4.1 `useBlogArticle` in `layers/blog/composables/useBlogContent.ts` auf die Auflösung über `usePeople` umstellen; `tests/content/blog-authors-query.spec.ts` um Fälle ergänzen (Team-Autor mit `profilePath`, externer Autor, unbekannter Slug wird übergangen, Reihenfolge nach Frontmatter); rot, dann grün; verifiziert durch `pnpm exec vitest run tests/content/blog-authors-query.spec.ts`
- [ ] 4.2 `PersonLink` in `layers/base/components/` (strukturelle Props, kein Fach-Layer-Import) mit Komponententest (`happy-dom`): Name als `NuxtLink` auf `to`, optional Avatar und Rolle; verifiziert durch `pnpm exec vitest run tests/architecture/layer-name-collisions.spec.ts tests/design-system`
- [ ] 4.3 Byline in `pages/blog/[...slug].vue` auf `PersonLink` umstellen; verifiziert durch `pnpm exec vitest run tests/a11y/heading-structure.spec.ts`
- [ ] 4.4 `ArticleCard` und `Top1` (`layers/blog/components/`) erhalten die Autoren als Prop und zeigen sie mit `PersonLink` über dem gestreckten Kartenlink (kein verschachteltes `<a>`); Komponententest für beide Autorenarten; `pages/blog/index.vue` löst alle Slugs einer Übersicht mit einer `usePeople`-Abfrage auf; verifiziert durch den Komponententest und `pnpm exec vitest run tests/a11y`
- [ ] 4.5 Autorenfilter: `tests/blog/author-filter.spec.ts` für eine reine Filterfunktion (Einzelwert, Liste, nicht freigegebener Artikel, unbekannter Slug, ungültige Slug-Form wird verworfen); `useBlogOverview` nimmt den Filter als Parameter, Cache-Key `blog-overview-<locale>-<author>`; `pages/blog/index.vue` liest `route.query.author` (Form `^[a-z0-9_-]{1,64}$`); rot, dann grün; verifiziert durch `pnpm exec vitest run tests/blog`
- [ ] 4.6 `tests/architecture/request-independent-render.spec.ts` nach Entscheidung zu offener Frage 2 um die eine benannte Ausnahme `pages/blog/index.vue` erweitern, mit Test, dass dort nur `author` gelesen wird; verifiziert durch `pnpm exec vitest run tests/architecture/request-independent-render.spec.ts`
- [ ] 4.7 `AuthorBox`-Komponente in `layers/blog/components/` (Avatar, Name, Rolle, Bio, Links über `toSafeExternalUrl`; bei Team-Autor Link auf das Profil statt Bio) und Leerzustand in `pages/blog/index.vue`; unbekannter Slug: 200, Leerzustand, `usePageSeo({ noindex: true })`; Komponententest; verifiziert durch `pnpm exec vitest run tests/blog tests/seo`
- [ ] 4.8 `usePageSeo` auf `pages/blog/index.vue` ändert den Canonical nicht (Query wird bereits entfernt); Test unter `tests/seo/blog-author-canonical.spec.ts` (Quelltext-Prüfung wie `tests/seo/event-noindex.spec.ts`, plus Prüfung, dass kein `canonical`-Override die Query trägt); verifiziert durch `pnpm exec vitest run tests/seo`
- [ ] 4.9 Neue Texte in `i18n/locales/de.json` und `en.json` (`blog.author.*`: Kasten, Leerzustand, „Beiträge von“, Link „Zum Profil“); verifiziert durch `pnpm exec vitest run tests/i18n`

## 5. Team-Profil: Beiträge und Events

- [ ] 5.1 `tests/blog/posts-by-author.spec.ts`: reine Funktion liefert freigegebene Artikel mit Slug in `author` (String und Liste), neueste zuerst, ohne zukünftige `releaseDate`, mit festem `now`; rot sehen
- [ ] 5.2 `useBlogPostsByAuthor(slug)` in `layers/blog/composables/` und `AuthorPostList` in `layers/blog/components/` umsetzen; verifiziert durch grüne Tests aus 5.1
- [ ] 5.3 `tests/events/events-by-host.spec.ts`: reine Funktion in `layers/events/utils/eventLists.ts` liefert gelistete Events mit Slug in `hosts` je Phase, schließt `unlisted` und verborgene Events aus, mit festem `now`; rot sehen
- [ ] 5.4 `useEventsByHost(slug)` in `layers/events/composables/useEvents.ts` (Phase im `useAsyncData`-Handler, in der Nutzlast übertragen) und `HostedEventList` in `layers/events/components/` umsetzen; verifiziert durch grüne Tests aus 5.3 und `tests/events/phase-on-server.spec.ts`
- [ ] 5.5 `pages/team/[slug].vue` setzt `AuthorPostList` und `HostedEventList` zusammen, beide nur bei Treffern; `layers/team` bleibt unverändert; i18n `team.profile.posts` und `team.profile.events` in `de` und `en`; verifiziert durch `pnpm exec vitest run tests/architecture tests/seo/team-thin-profiles.spec.ts tests/i18n` (Hinweis: `isThinTeamProfile` zählt Beiträge nicht mit; ob ein Profil mit Beiträgen nicht mehr als dünn gilt, ist ein eigener Entscheid und wird hier nicht geändert)

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
- [ ] 8.4 In `pnpm preview` unter `http://localhost:8788` prüfen: `/de/blog` (Autor auf Karten), `/de/blog?author=themeinerlp` (Liste, Kasten, genau ein Canonical auf `/de/blog` per View-Source), `/de/blog?author=niemand` (200, Leerzustand, `noindex`), Artikel-Byline mit Link, `/de/team/themeinerlp` (Abschnitt „Beiträge“, „Events“ nur bei Inhalt), ein temporäres Event mit `hosts` (nicht committen); keine Hydration-Warnung in der Konsole
- [ ] 8.5 `.nuxtrc`-Änderungen aus dem `nuxt`-Testumfeld nicht committen
- [ ] 8.6 Pull Request gegen `main` mit dem Titel `feat(content): cross-link authors and hosts with team profiles` öffnen (englische Beschreibung: Zusammenfassung, Begründung, Hinweis auf die Entscheidungen zu offenen Fragen 1 bis 3, Screenshot von Autorenkasten und Team-Profil, Hinweis, dass `add-events-section` und `add-unlisted-events` vorher archiviert sein müssen)
