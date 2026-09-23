# Tasks

Ein Pull Request, Reihenfolge nach design.md, Abschnitt „Migration Plan“. Vor
dem PR gilt: `pnpm test`, `pnpm build` und `pnpm quality` sind grün. Die
Baseline-Zahlen dürfen nur sinken. Umgesetzt auf dem Branch
`refactor/typescript-project-references` von `origin/main` (`0218399`), der
`add-events-section` (#375) schon enthält. Die Tasks 1.1–5.4 entstanden zuerst
auf `feat/events-section` und wurden per Patch übertragen.

## 1. Build-Modus absichern

- [x] 1.1 Probelauf mit einer temporären Referenz-Config im Scratchpad: `vue-tsc -b --noEmit` gegen die vier `.nuxt/tsconfig.*.json` ausführen. Festhalten, ob der Lauf ohne `composite` durchgeht und wo `*.tsbuildinfo` landet. Verifiziert durch die dokumentierte Ausgabe (Fehlerzahl je Projekt: app 17, server 78, shared 0, node 0). Falls `-b` scheitert, für die Tasks 3.2 und 3.3 den Fallback aus design.md, Entscheidung 1, verwenden. **Ergebnis 2026-09-23:** `-b` läuft ohne `composite` (95 Fehler = 17 App + 78 Server, reproduzierbar im zweiten, inkrementellen Lauf), `*.tsbuildinfo` landet in `.nuxt/` (bereits ignoriert)

## 2. Typ-Einstiege der Layer

- [x] 2.1 `layers/content-core/types.ts` exportiert zusätzlich per `export type` die Dokumenttypen aus `utils/content/repository.ts` und `Locale` aus `utils/content/locales.ts`. Die Exporte in `index.ts` bleiben. Verifiziert durch `pnpm typecheck` ohne neue Fehler
- [x] 2.2 `blog`, `community-poi`, `events`, `home` (`types-home.ts`), `sponsoring` und `team` importieren in ihren `types*.ts` aus `#layers/content-core/types` statt aus dem Barrel, `community-poi/types.ts` holt `COMMUNITY_POI_STATUS_ORDER` per `import type`. Verifiziert durch `pnpm typecheck` ohne neue Fehler und `grep "from '#layers/content-core'" layers/*/types*.ts` ohne Treffer
- [x] 2.3 `server/api/__sitemap__/team.ts` und `events.ts` importieren ihre Typen per `import type` aus `#layers/team/types` bzw. `#layers/events/types`. Die Kommentare dort und die Begründungen in `ALLOWED_DEEP_IMPORTS` beziehen sich danach nur noch auf den `locales`-Wert-Import. Verifiziert durch `pnpm build` (Sitemap-Routen gebaut) und `vue-tsc --noEmit -p .nuxt/tsconfig.server.json` ohne Fehler außerhalb von `server/`, `shared/` und `layers/*/types*.ts`
- [x] 2.4 `module-boundaries.spec.ts` um die drei Regeln aus design.md, Entscheidung 4, erweitern und für jede Regel einen positiven und einen negativen Selbsttest nach dem Muster der vorhandenen `referencesIn`/`deepImportsIn`-Tests schreiben (Typ-Einstieg als `import type` erlaubt, als Wert verboten; Barrel in `types*.ts` verboten; Barrel in `server/` verboten, auch als `import type`). Verifiziert durch `pnpm test tests/architecture` grün und durch einen testweise wieder eingebauten Barrel-Import in `server/api/__sitemap__/team.ts`, der den Test mit Dateiname und Hinweis auf `#layers/team/types` rot macht

## 3. Umstellung auf Project References

- [x] 3.1 Verbleibende Fehler im Server-Projekt beheben (z. B. `Locale` in `repository.ts` aus `locales.ts` statt aus `collections.ts` beziehen, falls das die Ursache ist). Verifiziert durch `vue-tsc --noEmit -p .nuxt/tsconfig.server.json` mit 0 Fehlern
- [x] 3.2 `tsconfig.json` auf `files: []` plus die vier `references` umstellen, `server/tsconfig.json` löschen, `package.json` `typecheck` auf `vue-tsc -b --noEmit` setzen und, falls nötig, die `*.tsbuildinfo`-Ablage in `.gitignore` aufnehmen. Verifiziert durch `pnpm typecheck` mit 17 Fehlern (nur App) und durch eine Probedatei `server/api/_probe.ts` mit `useI18n()`, die einen Fehler erzeugt und danach wieder gelöscht wird
- [x] 3.3 In `scripts/quality-gate.mjs` die `TSC_ARGS` an `typecheck` angleichen und Fehler als eindeutige `(Datei, Zeile, Spalte, Code)` zählen. Den Kopfkommentar entsprechend ergänzen. Verifiziert durch einen Unit-Test der Zählfunktion mit doppelter Zeile und durch `pnpm quality`, das für `typeErrors` dieselbe Zahl meldet wie `pnpm typecheck`

## 4. App-Typfehler beheben

- [x] 4.1 `LanguageSelector.vue` (6×: Index-Zugriffe mit `undefined`, `string` statt Locale-Code) mit Typwächtern bzw. dem Locale-Typ aus `#layers/content-core/types` korrigieren. Verifiziert durch `pnpm typecheck` ohne Treffer in der Datei und `tests/i18n` grün
- [x] 4.2 `NavigationBar.vue:72` und `navItems.ts`: `routeName` auf typisierte Routennamen einengen und den Cast `localePath(… as any)` entfernen. Verifiziert durch `pnpm typecheck` und ESLint ohne Treffer in beiden Dateien. **Umgesetzt:** Der Fehler in Zeile 72 kam aus `BuiltGroup = NavGroupConfig & { children: BuiltLink[] }` (Schnitt zweier Array-Typen), jetzt `Omit<…, 'children'>`. Der Cast war überflüssig, weil `localePath` `string` annimmt. `routeName` bleibt `string`: typisierte Routennamen setzen `experimental.typedPages` voraus, also eine Änderung an `nuxt.config.ts`, die außerhalb dieses Changes liegt
- [x] 4.3 `SocialMediaShare.vue` (Icon-Tupel `readonly`), `useArticleSeo.ts` (Getter-Form von `useSeoMeta`), `usePageSeo.ts` (`ogImageType` auf den MIME-Literaltyp einengen) und `pages/index.vue` (`null` gegen `undefined`) korrigieren. Verifiziert durch `pnpm typecheck` ohne Treffer in diesen Dateien und `tests/seo` grün. **Umgesetzt auf `origin/main`:** `SocialMediaShare` ist dort über den `IconName`-Typ von `IconFa` schon korrekt, die `IconFa`-Änderung entfällt. Getter-Form und `ogImageType` hat #350 bereits behoben (die Getter-Form war ein echter Laufzeitfehler: Artikel lieferten kein `og:type=article`). Übrig war auf `main` `defineOgImage('NuxtSeo', …)` (TS2345, bloßer Name mehrdeutig), jetzt `'NuxtSeo.satori'`, weil satori der einzige installierte Renderer ist. `pages/index.vue` über `OpenCollectiveStats` (`contributors?: number | null`)
- [x] 4.4 `ufo` als direkte Abhängigkeit in der von Nuxt verwendeten Version aufnehmen und `ProseImg.vue:46` (`pathOnly` möglicherweise `undefined`) absichern. Verifiziert durch `pnpm install`, `pnpm typecheck` ohne Treffer in `ProseImg.vue` und `pnpm build`
- [x] 4.5 `eslint.config.mjs:9`: den Zugriff auf `config.rules` des a11y-Presets typsicher machen (Typwächter bzw. `'rules' in config`), ohne `@ts-*`-Kommentar. Verifiziert durch `pnpm typecheck` ohne Treffer und `pnpm lint` mit derselben a11y-Regelkonfiguration (Stichprobe: `vuejs-accessibility/label-has-for` weiterhin aktiv)

## 5. Umgehungen der Typprüfung entfernen

- [x] 5.1 AST-Typ `ContentAstNode` (Minimark-Tupel, Knotenobjekt, Textknoten) mit Typwächtern in `content-core` anlegen, per `export type` über `types.ts` veröffentlichen und `extractPlainText` darauf umstellen. Unbekannte Knoten werden übersprungen. Verifiziert durch Unit-Tests für Minimark-Body, Legacy-Excerpt, unbekannten Knoten und das Kürzen auf `maxLength` sowie ESLint ohne `no-explicit-any` in `utils/content.ts`
- [x] 5.2 `head` in `repository.ts` ohne `any` typisieren. Verifiziert durch ESLint ohne Treffer und `pnpm typecheck` ohne neue Fehler in `blog`-Aufrufern
- [x] 5.3 Die `(t as any)`-Casts in `ProsePre.vue` (3×) und `ProseHeading.vue` (1×) entfernen. Verifiziert durch ESLint und `pnpm typecheck` ohne Treffer sowie durch die gerenderten Labels (Dateiname, Sprache, Permalink) in einem Artikel unter `pnpm dev` auf DE und EN
- [x] 5.4 Das `@ts-ignore` in `ServerAddresses.vue` entfernen. Verifiziert durch `pnpm typecheck` ohne neuen Fehler und ESLint ohne `ban-ts-comment`

## 6. Abschluss

- [x] 6.1 AGENTS.md, Abschnitt „Nitro cannot reliably reach app code“, und den Abschnitt zu `index.ts` um den Typ-Einstieg `#layers/<name>/types` ergänzen (wann er zu benutzen ist und warum `server/` nie ein Barrel importiert). Verifiziert durch Review im PR
- [ ] 6.2 Gesamtprüfung: `pnpm test`, `pnpm build`, `pnpm typecheck` (erwartet genau 3 Fehler: `useHomeContent.ts:14/27`, `useCommunityPoi.ts:14`) und ESLint ohne Befunde für `no-explicit-any` und `ban-ts-comment`. Danach `pnpm quality:update` ausführen und `quality-baseline.json` mit gesunkenen Werten committen. Verifiziert durch den grünen CI-Lauf beider Jobs im PR
