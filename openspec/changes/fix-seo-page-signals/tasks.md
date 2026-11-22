# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (reine Datei-Lesetests, kein
Server, keine Systemzeit). Schwere Läufe (Build, volle Suite) über `heavy`.
Branch von aktuellem `origin/main` (enthält diesen Vorschlag).

## 1. Überschriften

- [ ] 1.1 [Haiku] `tests/seo/heading-levels.spec.ts`: `pages/blog/index.vue` enthält genau ein `<h1`; `layers/blog/components/Top1.vue` enthält kein `<h1` und ein `<h2` mit `text-headline-small`; `ArticleCard.vue` enthält kein `<h1`. Rot sehen
- [ ] 1.2 [Haiku] `Top1.vue`: `<h1>` → `<h2>`, Klassen unverändert; grüne Tests aus 1.1

## 2. Längen von Titel und Description

- [ ] 2.1 [Haiku] `tests/seo/meta-lengths.spec.ts`: je Sprache (a) jede Meta-Description-Quelle zwischen 50 und 155 Zeichen (i18n-Keys aus den `usePageSeo`-Aufrufen in `pages/`, Blog-`seo.description`/`description`, `summary` in `content/{projects,events,community-poi}`; Frontmatter mit kleinem Parser lesen, nur oberste Schlüssel); (b) jeder Titel-Key aus `tests/seo/localized-titles.spec.ts` plus Suffix ` | OneLiteFeather` (Startseite ohne) höchstens 60 Zeichen; die Fehlermeldung nennt Datei und Länge. Rot sehen
- [ ] 2.2 [Haiku] `index.title` in `de.json` auf `OneLiteFeather – Minecraft-Server & Open Source` (Wortlaut aus `design.md`); weitere Titel-Keys kürzen, die 2.1 meldet; `tests/seo/localized-titles.spec.ts` bleibt grün
- [ ] 2.3 [Sonnet] Descriptions kürzen: `index.description` (de/en, Wortlaut aus `design.md`), `about.description` und `projects.overview.description` (de), die elf Blog-Frontmatter und die fünf `summary`-Felder aus der Tabelle in `design.md`; redaktionell, erster Satz bleibt, keine Spielwerte. Grüne Tests aus 2.1 und `tests/seo/brand-name.spec.ts`
- [ ] 2.4 [Haiku] `tests/seo/brand-name.spec.ts`: Längenobergrenze der Startseiten-Description von 200 auf 155; `scripts/seo-check.mjs`: `DESCRIPTION_MAX = 155`

## 3. Weiterleitung `/blog/**`

- [ ] 3.1 [Haiku] `tests/seo/legacy-blog-redirect.spec.ts`: `nuxt.config.ts` enthält für `/blog` und `/blog/**` eine `redirect`-Regel mit `statusCode: 301` und Ziel `/en/blog` bzw. `/en/blog/**`; keine der beiden Quellen trägt `cloudflare-cdn-cache-control`; `/` bleibt `no-store`. Rot sehen
- [ ] 3.2 [Haiku] Regeln in `routeRules` ergänzen (neben den Umbenennungs-Redirects); grüne Tests aus 3.1 und `tests/architecture`

## 4. Schema.org

- [ ] 4.1 [Haiku] `tests/seo/site-identity.spec.ts` ergänzen: Organization-`logo` in Basis- und `$production`-Identity ist ein `ImageObject` mit `width`/`height` gleich den IHDR-Maßen von `public/images/logo.png`; `usePageSeo.ts` und `useArticleSeo.ts` lesen `localeProperties` für `inLanguage`, nicht `locale.value`. Rot sehen
- [ ] 4.2 [Haiku] `nuxt.config.ts` (Basis und `$production`) und die beiden Composables anpassen; grüne Tests aus 4.1 und `pnpm exec vitest run tests/architecture/production-config.spec.ts`

## 5. Abschluss

- [ ] 5.1 [Haiku] `heavy pnpm test`, `heavy pnpm typecheck`, `heavy pnpm quality` (Baseline steigt nicht)
- [ ] 5.2 [Haiku] `NODE_ENV=production heavy pnpm build`, `pnpm preview:prod`; per `curl`: `/blog/x` → 301 auf `/en/blog/x`, `/blog` → 301 auf `/en/blog`; `/en/blog` hat genau ein `<h1>`; JSON-LD zeigt Logo mit Maßen und `inLanguage` `en-US`; `pnpm seo:check -- --base http://localhost:8787 --no-mock` ohne Längenwarnungen
- [ ] 5.3 [Haiku] `.nuxtrc`-Änderungen und `openspec/` nicht committen; Commits nur vom Typ `fix(seo)`
- [ ] 5.4 [Haiku] Pull Request gegen `main` mit dem Titel `fix(seo): tidy headings, title and description lengths and locale-less blog links` öffnen. Beschreibung auf Englisch als kurze Domain-Story (keine PR-Vorlage im Repo): was Besucher und Suchmaschinen vorher sahen (zwei Hauptüberschriften, abgeschnittene Snippets, 404 auf alte Blog-Links), wie es gelöst wurde, Messung im Preview. Keine Session-Links oder Trailer
