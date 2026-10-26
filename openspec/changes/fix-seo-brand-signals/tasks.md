# Tasks

Jede Aufgabe: Test zuerst (rot sehen), dann Code (grün). Tests nach
F.I.R.S.T.: keine Sleeps, keine Systemzeit, kein Netzwerk, ein Verhalten pro
Test. Kommentare im Code höchstens 1–2 Zeilen zum nicht offensichtlichen
Warum. Branch von aktuellem `origin/main`.

## 1. JSON-LD-Prüfung (zuerst, sie misst alles Weitere)

- [x] 1.1 [Haiku] `tests/scripts/jsonld-checks.spec.ts` mit festen Graph-Fixtures anlegen, je ein Test pro Befund: gültiger Startseiten-Graph → keine Befunde; `WebSite` ohne `alternateName`; `WebSite.url` = `…/en`; `WebSite` mit `translationOfWork`; zwei `WebSite`-Knoten; Organization-`logo` auf `.svg`; `Article` ohne `dateModified`; `Article.author` ohne `url`; `ProfilePage.mainEntity` auf fehlende `@id`; `isPartOf` auf fehlende `@id`; `primaryImageOfPage` auf `.svg`. Rot sehen (Modul fehlt)
- [x] 1.2 [Sonnet] `scripts/jsonld-checks.mjs` mit reinen, exportierten Funktionen (Eingabe: Knotenliste, Origin; Ausgabe: Befund-Strings) anlegen; verifiziert durch grüne Tests aus 1.1
- [x] 1.3 [Sonnet] `scripts/seo-check.mjs`: in `checkPage` die Funktionen aus 1.2 auf die bereits geparsten Knoten anwenden (Article-Prüfung nur auf Artikeln, ProfilePage nur auf Teamprofilen); Meta-Robots gegen `X-Robots-Tag` vergleichen (`index`/`noindex`); ein indexierbares und ein dünnes Teamprofil über die Links von `/en/team` finden und prüfen. Gegen `pnpm preview:prod` laufen lassen und festhalten, dass es heute mit den erwarteten Befunden rot ist

## 2. WebSite auf Domain-Ebene

- [x] 2.1 [Haiku] `tests/seo/site-identity.spec.ts`: `websiteId('https://onelitefeather.net')` und mit abschließendem `/` → `https://onelitefeather.net/#website`; `rootWebSiteNode(...)` liefert `url` `https://onelitefeather.net/`, `name`, `alternateName` `['OneLiteFeather Network', 'onelitefeather.net', 'OLF']`, `inLanguage` beider Locales, die übergebene `description` und keine `translationOfWork`/`workTranslation`; mit `http://localhost:3000` → `http://localhost:3000/`. Rot sehen
- [x] 2.2 [Haiku] `websiteId` in `layers/content-core/utils/schema-ids.ts`, `rootWebSiteNode` in `layers/content-core/utils/siteIdentity.ts`; verifiziert durch grüne Tests aus 2.1
- [x] 2.3 [Sonnet] `layers/content-core/plugins/site-identity.server.ts` nach `design.md` Entscheidung 1: `dependsOn: ['nuxt-schema-org:defaults']`, Ausstieg bei `useError()`, WebSite per `useHead`-Script (`key: 'schema-org-graph'`, `tagDuplicateStrategy: 'replace'`, `tagPriority: 'high'`), `defineWebPage({ isPartOf })` per `useSchemaOrg`. Verifiziert: `NODE_ENV=production pnpm build`, `pnpm preview:prod`, `curl` auf `/en`, `/de`, `/de/team`, einen Artikel → genau ein `WebSite` mit Root-`@id`/`url`, `WebPage.isPartOf` = Root-`@id`, kein `translationOfWork`. Wirkt `replace` nicht wie gelesen: auf die Alternative `schemaOrg.defaults: false` + eigener Defaults-Plugin wechseln und das im PR begründen
- [x] 2.4 [Haiku] `pnpm exec vitest run tests/architecture` grün (insbesondere `request-independent-render`, `module-boundaries`, `layer-name-collisions`)

## 3. Organization

- [x] 3.1 [Haiku] `tests/seo/brand-name.spec.ts` ergänzen: `schemaOrg.identity.description` und `site.description` in `nuxt.config.ts` gleich `nuxtSiteConfig.description` aus `en.json` (Grundwert); `tests/seo/site-identity.spec.ts`: `rootOrganizationNode` bzw. das Plugin liefert die Beschreibung der Seitensprache (DE/EN); `logo` in Basis- und `$production`-Identity endet auf `/images/logo.png`; `public/images/logo.png` ist ein PNG mit Breite und Höhe ≥ 112 (IHDR lesen). Rot sehen
- [x] 3.2 [Haiku] `public/images/logo.png` (512×512) einmalig mit `rsvg-convert -w 512 -h 512 public/images/logo.svg -o public/images/logo.png` erzeugen; `nuxt.config.ts` anpassen (nur skalare Felder, nichts doppeln); im Plugin aus 2.3 ein zweiter `defineOrganization`-Merge mit `@id` `organizationId(siteUrl)` und der lokalisierten `description`; verifiziert durch grüne Tests aus 3.1 und `pnpm exec vitest run tests/architecture/production-config.spec.ts`

## 4. Startseite nennt die Domain

- [x] 4.1 [Haiku] `tests/seo/brand-name.spec.ts` ergänzen: `index.description` in `de.json` und `en.json` beginnt mit `OneLiteFeather`, enthält `onelitefeather.net`, Länge 50–200; `useHomeSeo.ts` nutzt `t('index.description')`. Rot sehen
- [x] 4.2 [Haiku] Keys anlegen (Wortlaut aus `design.md` Entscheidung 3, offene Frage 5) und `useHomeSeo` umstellen; verifiziert durch grüne Tests aus 4.1 und `tests/seo/default-description.spec.ts`

## 5. `primaryImageOfPage`

- [x] 5.1 [Haiku] `tests/seo/primary-image.spec.ts` (Quelltext-Prüfung wie `event-noindex.spec.ts`, weil `defineOgImage` im Nuxt-Testumfeld fehlt): `defineWebPage` in `usePageSeo.ts` setzt `primaryImageOfPage` aus `socialImage`; `useArticleSeo.ts` setzt es aus `previewSocial`. Rot sehen
- [x] 5.2 [Haiku] Beides umsetzen; verifiziert durch grüne Tests aus 5.1; das Verhalten prüft `seo-check` (1.3)

## 6. ProfilePage `mainEntity`

- [x] 6.1 [Haiku] `tests/seo/team-thin-profiles.spec.ts` um einen Test ergänzen: `pages/team/[slug].vue` registriert `defineWebPage` mit `mainEntity` und `personId(site.url, …)`. Rot sehen
- [x] 6.2 [Haiku] Umsetzen nach `design.md` Entscheidung 5; verifiziert durch grüne Tests aus 6.1

## 7. `codeRepository` → `sameAs`

- [x] 7.1 [Haiku] `tests/projects/software-application.spec.ts`: die beiden `codeRepository`-Tests ersetzen durch „kein `codeRepository`“, „Repository-URL in `sameAs`“, „ohne Quellcode-Link kein `sameAs`“. Rot sehen
- [x] 7.2 [Haiku] `layers/projects/utils/softwareApplication.ts` (und den Knotentyp) anpassen; verifiziert durch grüne Tests aus 7.1 und `pnpm exec vitest run tests/projects`

## 8. Robots über `useRobotsRule`

- [x] 8.1 [Haiku] `tests/seo/robots-header.spec.ts` (Quelltext-Prüfung): `usePageSeo.ts` ruft `useRobotsRule` mit der Direktive auf und schreibt kein `name: 'robots'` mehr per `useHead`. Rot sehen
- [x] 8.2 [Haiku] Umsetzen nach `design.md` Entscheidung 7; verifiziert durch grüne Tests aus 8.1, `tests/seo/event-noindex.spec.ts`, `tests/seo/team-thin-profiles.spec.ts`

## 9. Titel

- [x] 9.1 [Haiku] `tests/seo/localized-titles.spec.ts`: für eine feste Liste von Titel-Keys (`index.title`, `events.title`, `community.title`, `community_poi.overview.title`, `bluemap.title`, `blog.overview.page_title`, `blog.author.title`, `team.title` und die übrigen `usePageSeo`-Titel-Keys) ist der DE-Wert ≠ EN-Wert, außer für eine Ausnahmeliste mit Begründung je Eintrag (`bluemap.title`, `community.title`, `team.title`); `events.title` in `de.json` ist `Veranstaltungen`; `blog.overview.page_title` enthält in beiden Sprachen `Blog`. Rot sehen
- [x] 9.2 [Haiku] Übersetzungen in `i18n/locales/de.json`/`en.json` (Tabelle in `design.md` Entscheidung 8), `pages/blog/index.vue` nutzt `blog.overview.page_title` für `usePageSeo` und `definePageMeta`; Breadcrumbs bleiben bei `blog.overview.title`; verifiziert durch grüne Tests aus 9.1 und `tests/seo/page-titles.spec.ts`
- [x] 9.3 [Haiku] `seo.title` im Frontmatter von `content/blog/de/dev-blog-1.md` und `content/blog/en/dev-blog-1.md`; prüfen, dass der Adapter `seo` an `useArticleSeo` liefert (Projektion in `layers/content-core/utils/content/`); verifiziert per `curl` im Preview: `<title>` beider Artikel unterschiedlich

## 10. Abschluss

- [x] 10.1 [Haiku] `pnpm test` grün
- [x] 10.2 [Haiku] `pnpm typecheck` und `pnpm quality` laufen; `quality-baseline.json` steigt nicht
- [x] 10.3 [Haiku] `NODE_ENV=production pnpm build`, `pnpm preview:prod`, dann `pnpm seo:check -- --base http://localhost:8787 --no-mock` und `node scripts/cache-check.mjs --base http://localhost:8787` grün
- [x] 10.4 [Haiku] Per `curl` im Preview: `/` antwortet 302 mit `no-store`; `/en` hat unveränderten Canonical und Hreflang inkl. `x-default` → `/en`; ein dünnes Teamprofil hat Meta und `X-Robots-Tag` mit `noindex`
- [x] 10.5 [Haiku] `.nuxtrc`-Änderungen aus dem `nuxt`-Testumfeld und `openspec/config.yaml` nicht committen; Commits nur vom Typ `fix(seo)` (Tests gehören dazu)
- [x] 10.6 [Haiku] Pull Request gegen `main` mit dem Titel `fix(seo): give google one root website identity and consistent page signals` öffnen. Beschreibung auf Englisch als kurze Domain-Story (das Repo hat keine PR-Vorlage unter `.github/`; Aufbau: Zusammenfassung, Ursache je Problem, gewählte Root-Variante (a) mit einem Satz zu (b), Messung am Build vorher/nachher, Hinweis auf Crawl-Verzug und Search-Console-Nachprüfung). Keine Session-Links oder Trailer
