# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Alles ist ein einziger Pull Request unter `feat(about)`; Commits folgen
Conventional Commits, Tests im selben Commit wie der Code, den sie treiben.
Tests folgen F.I.R.S.T.: kein Netz, keine Systemzeit, kein Warten, jeder Test
baut sein eigenes Fixture.

## 1. Inhalt

- [x] 1.1 `tests/about/content.spec.ts` schreiben: für `de` und `en` hat `content/about/<locale>/home.json` Einleitung, vier Säulen (Symbol, Titel, Text, `to` aus `/community-poi`, `/projects`, `/events`, `/blog`), Abschnitt „Wie wir arbeiten“; die Symbole sind in `plugins/fontawesome.ts` registriert; beide Sprachen haben dieselben Säulen-Ziele; kein „Ethanol“; der deutsche Text nennt 2021; `tests/content/adapter-queries.spec.ts` kennt `getAboutDocument` → `about_de`; rot sehen
- [x] 1.2 `content.config.ts` (Schema, Sammlung `about`), `content/about/{de,en}/home.json`, `ContentRepository.getAboutDocument`, Adapter und Typ-Exporte umsetzen; verifiziert durch grüne Tests aus 1.1 und `pnpm exec vitest run tests/content tests/content-core tests/architecture`

## 2. Layer und Seite

- [x] 2.1 `tests/about/page.spec.ts` schreiben (liest die Quelle und rendert Komponenten): ein `h1`, fünf `h2` in Reihenfolge, `usePageSeo` mit `schemaType: 'AboutPage'`, `about` verweist auf `#identity`, `CommunityStrip` mit Zahlen aus `useCommunityOverview()` und Link `/<locale>/community`, vier Mitmachen-Links mit den Zielen, externe Links mit `noopener noreferrer`, Symbole `aria-hidden`, keine Query; `foundingDate` in `nuxt.config.ts` ist `2021`; rot sehen
- [x] 2.2 `layers/about/` (`nuxt.config.ts`, `index.ts`, `types.ts`, `composables/useAbout.ts`, Komponenten `AboutPillars.vue`, `AboutJoin.vue`), `pages/about.vue`, i18n-Schlüssel `about.*` in `i18n/locales/{de,en}.json` und `foundingDate: '2021'` umsetzen; verifiziert durch grüne Tests aus 2.1 und `pnpm exec vitest run tests/architecture tests/i18n tests/a11y tests/seo`

## 3. Fußzeile und Navigation

- [x] 3.1 `tests/footer/links.spec.ts` auf `/de/about` und `/en/about` ändern, `tests/navigation/structure.spec.ts` um „Über uns“ in der Gruppe `more` ergänzen (Obergrenze sechs bleibt); rot sehen
- [x] 3.2 `SiteFooter.vue` auf `/about` umstellen, `navigation.about` und Eintrag in `layers/navigation/navItems.ts` ergänzen; `AGENTS.md` führt `about` in der Layer-Liste; verifiziert durch grüne Tests aus 3.1

## 4. Gesamtprüfung

- [x] 4.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [x] 4.2 `pnpm preview`: `/de/about` und `/en/about` antworten mit 200, eine `h1`, Canonical auf sich selbst, hreflang, `AboutPage` und `Organization` mit `foundingDate` 2021, alle Mitmachen-Links; die Fußzeile verlinkt `/de/about`, die Gruppe „Mehr“ enthält Über uns, die Sitemap listet beide Seiten; Screenshots bei 1480×900 und 390×844 gesichtet

## 5. Pull Request

- [x] 5.1 Pull Request mit dem Titel `feat(about): add an about us page` öffnen (Beschreibung auf Englisch: Zusammenfassung, Begründung, Belege aus 4.2, Hinweis auf die Änderung von `foundingDate`)
