# Tasks

## 1. Catch-all-Slug

- [ ] 1.1 `tests/base/catch-all-segments.spec.ts`: `catchAllSegments` liefert die nicht leeren Segmente für `['x','']`, `['x']`, `'x'`, `['']`, `''`, `undefined`; rot sehen (Datei fehlt)
- [ ] 1.2 `layers/base/utils/catchAllSegments.ts` anlegen; verifiziert durch grüne Tests aus 1.1
- [ ] 1.3 Verwenden in `layers/blog/composables/useBlogContent.ts` (`slugSegments`, Zeile ~144), `layers/community-poi/composables/useCommunityPoi.ts` (Zeile ~92) und `layers/events/composables/useEvents.ts` (`slug`, Zeile ~126); verifiziert durch `pnpm exec vitest run tests/architecture tests/events tests/blog`

## 2. Canonical in `usePageSeo`

- [ ] 2.1 `tests/seo/canonical-url.spec.ts`: `withoutTrailingSlash` entfernt `/` am Ende des Pfads, lässt `https://onelitefeather.net/` stehen, entfernt Query und Hash nicht selbst, ändert `…/en/blog` nicht; rot sehen
- [ ] 2.2 `layers/content-core/utils/canonicalUrl.ts` anlegen und in `cleanUrl` von `layers/content-core/composables/usePageSeo.ts` einsetzen; verifiziert durch grüne Tests aus 2.1

## 3. Keine Roh-Pfade im Payload

- [ ] 3.1 `tests/content/adapter-queries.spec.ts` um Fälle ergänzen: Zeilen aus `first()` und `all()` (Team, Team-FAQ, Server-Konzept, Sponsoren, Blogartikel) verlieren `path` und `stem`, behalten `id`, `body`, `slug`; rot sehen
- [ ] 3.2 `withoutRoutes` in `layers/content-core/utils/content/nuxtContentAdapter.ts` auf alle `.first()`/`.all()` anwenden; verifiziert durch `pnpm exec vitest run tests/content tests/architecture`

## 4. Abschluss

- [ ] 4.1 `pnpm test` läuft grün
- [ ] 4.2 `pnpm typecheck` und `pnpm quality` laufen; die Zahlen in `quality-baseline.json` steigen nicht
- [ ] 4.3 `pnpm build` läuft grün
- [ ] 4.4 In `pnpm preview` per `curl` prüfen: `/en/blog/dev-blog-1-what-we-using/` und `/de/team/themeinerlp/` liefern einen Canonical ohne `/` (Artikel mit Inhalt, Titel nicht „Title“), die Varianten ohne `/` sind unverändert, und `/en`, `/de/team`, `/en/team`, `/en/blog/dev-blog-1-what-we-using` enthalten weder `team-faq/en/`, `server-concept/en/`, `sponsors/`, `/blog/en/` noch `faq/en/` als Strings
- [ ] 4.5 `.nuxtrc`-Änderungen aus dem `nuxt`-Testumfeld und `openspec/config.yaml` nicht committen
- [ ] 4.6 Pull Request gegen `main` mit dem Titel `fix(seo): drop trailing slashes from canonicals and stop leaking content paths` öffnen (englische Beschreibung: Zusammenfassung, Ursache je Problem, Messung am Build, Hinweis auf den separaten Cloudflare-Redirect)
