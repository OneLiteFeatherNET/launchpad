# Design: TypeScript-Projekte nach Nuxt 4 trennen

## Context

Die Motivation steht in proposal.md unter „Why“. Für den Ansatz zählen diese
Fakten (gemessen am 2026-09-23 auf `feat/events-section`, Nuxt 4.4.8,
vue-tsc 3, TypeScript 5.9):

- `nuxt prepare` erzeugt in `.nuxt/` vier Projekte. `srcDir` ist das
  Repository-Root, deshalb schließt `tsconfig.app.json` `../**/*` ein und nimmt
  `../server`, `../layers/*/server` und die Konfigurationsdateien aus. Die
  Dateien unter `shared/` liegen in `app` **und** in `shared`, und auch
  `eslint.config.mjs`, `content.config.ts`, `scripts/` und `tests/` fallen ins
  App-Projekt.
- Alle vier Projekte setzen `strict`, `noUncheckedIndexedAccess` und
  `verbatimModuleSyntax: true`. Keins ist `composite`, alle haben `noEmit`.
- `nuxi typecheck` (`@nuxt/cli` 3.36) ruft `vue-tsc -b --noEmit` auf, sobald
  das Root-`tsconfig.json` `references` hat, sonst `vue-tsc --noEmit`.
- Die Barrels `layers/<name>/index.ts` exportieren Composables als Werte. Ein
  `import type` aus einem Barrel ist zur Laufzeit wirkungslos, lädt aber für
  den Compiler das ganze Barrel samt Composables. Alle sechs Domänen-`types.ts`
  (`blog`, `community-poi`, `events`, `home/types-home`, `sponsoring`, `team`)
  importieren aus dem Barrel `#layers/content-core`. `community-poi/types.ts`
  holt sich `COMMUNITY_POI_STATUS_ORDER` dort sogar als Wert.
- Die Dokumenttypen (`TeamDocument`, `EventDocument`, …) liegen in
  `content-core/utils/content/repository.ts`. Diese Datei hat nur
  `import type`-Imports, aber `content-core/types.ts` exportiert sie heute
  nicht. Sie sind nur über das Barrel erreichbar.
- `tests/architecture/module-boundaries.spec.ts` verbietet jeden Deep-Import
  (`DEEP_IMPORT`) außer den in `ALLOWED_DEEP_IMPORTS` pro Datei registrierten
  Ausnahmen. Die beiden Sitemap-Routen sind dort wegen ihres
  `locales`-Wert-Imports eingetragen.

## Goals / Non-Goals

**Goals:**
- Das Typprogramm jeder Umgebung enthält nur Code, der dort auch läuft.
- Der Weg „Typen über Layer-Grenzen“ ist eindeutig und wird maschinell
  geprüft, statt in Kommentaren erklärt zu werden.
- `pnpm typecheck`, `nuxi typecheck` und der Ratchet messen dasselbe.

**Non-Goals:**
- Getrennte Projekte für `tests/` oder `scripts/`. Beide bleiben im
  App-Projekt, wie Nuxt es erzeugt.
- Eine `nuxt.config.ts`-Änderung. Der Change kommt ohne aus, damit er nicht in
  der Konfliktzone der laufenden Changes landet.

## Decisions

### 1. Root-`tsconfig.json` nur mit `references`, Build-Modus für den Check

```jsonc
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

`typecheck` wird zu `vue-tsc -b --noEmit`, also genau dem Aufruf von
`nuxi typecheck`.

- *Alternative: vier `vue-tsc -p`-Läufe hintereinander.* Das funktioniert ohne
  Build-Modus, bindet aber Skript und Ratchet an die Liste der Projekte, und
  die ändert Nuxt zwischen Minor-Versionen. Diese Variante bleibt der
  Fallback, falls `-b` an den nicht-`composite`-Projekten scheitert (siehe
  Risiken).
- *Alternative: `nuxi typecheck` direkt.* Das wäre gleichwertig, aber der
  Ratchet braucht die rohe Ausgabe und den Exitcode von `vue-tsc`, und
  `nuxi typecheck` führt zusätzlich ein eigenes `prepare` aus, das der Ratchet
  schon selbst erledigt.

`server/tsconfig.json` entfällt. Es erweitert nur
`.nuxt/tsconfig.server.json` um den ebenfalls entfallenden Override, und kein
Werkzeug liest es. Editoren finden die Server-Config über die Referenz.

### 2. `verbatimModuleSyntax`-Override ersatzlos streichen

Ein Lauf gegen `.nuxt/tsconfig.app.json` mit `verbatimModuleSyntax: true`
ergibt dieselben 17 Fehler wie heute. Der Override hat also keinen Grund mehr
(er stammt aus `c82572c`, der Einführung des SEO-Moduls). In Nuxt würde er
über `typescript.tsConfig` in `nuxt.config.ts` gehören, und dieser Weg
entfällt damit auch.

### 3. Typ-Einstieg `#layers/<name>/types` statt Typen nach `shared/types`

Jede `layers/<name>/types.ts` wird zur öffentlichen, reinen Typfläche des
Layers. Für sie gilt:

- jeder Import ist `import type` (auch für `typeof KONSTANTE[number]`,
  TypeScript erlaubt `typeof` auf typ-importierte Werte). Lokal definierte
  Literal-Konstanten wie `EVENT_PHASES` oder `TEAM_RANK_ORDER` bleiben in der
  Datei. Sie laden kein Modul, und sie auszulagern brächte nur Churn
  (entschieden bei der Umsetzung am 2026-09-23);
- Imports nur aus eigenen Typdateien, aus `#layers/<foundation>/types` und, nur
  in `content-core`, aus `@nuxt/content`;
- `content-core/types.ts` exportiert zusätzlich die Dokumenttypen und
  `Locale` aus `repository.ts` bzw. `locales.ts`. Die Einträge bleiben
  zusätzlich im Barrel, damit sich für App-Aufrufer nichts ändert.

`server/api/__sitemap__/*.ts` importieren dann per `import type` aus
`#layers/team/types` bzw. `#layers/events/types`.

- *Alternative: Dokumenttypen nach `shared/types/`.* Das wäre der
  Nuxt-Standardort für Typen, die beide Seiten brauchen. Die Typen basieren
  aber auf den generierten `@nuxt/content`-Typen. `tsconfig.shared.json` kennt
  die nicht, und laut AGENTS.md darf nur `content-core` `@nuxt/content`
  benennen. Beides spricht dagegen.
- *Alternative: das Barrel aufteilen (`index.ts` nur Typen, Composables
  anderswo).* Das bricht jede App-Stelle, die `#layers/team` benutzt, und
  ändert die Konvention „`index.ts` ist die öffentliche Fläche“ für alle
  Layer. Der Nutzen wäre derselbe, der Diff viel größer.

### 4. Architekturtest: eine Regel für den Typ-Einstieg

`module-boundaries.spec.ts` bekommt drei Prüfungen. Die bestehenden Regeln
bleiben unverändert:

1. Ein Deep-Import, dessen Pfad genau `#layers/<name>/types` ist, gilt nicht
   als verbotener Deep-Import, **wenn** die Anweisung `import type` bzw.
   `export type` ist. Als Wert-Import bleibt er verboten.
2. Jede `layers/*/types*.ts` darf nur `import type`-Imports enthalten und
   kein Barrel (`#layers/<name>` ohne Subpfad) importieren.
3. Dateien unter `server/` dürfen kein Barrel `#layers/<name>` importieren,
   auch nicht als `import type`.

Die Ausnahmen in `ALLOWED_DEEP_IMPORTS` für die Sitemap-Routen bleiben
bestehen, weil der `locales`-Wert-Import unverändert bleibt. Ihre Begründung
wird so angepasst, dass sie sich nur noch auf `locales` bezieht.

- *Alternative: allein auf den Compiler verlassen.* Nach Entscheidung 1
  meldet der Server-Check Fehler in Composables, sobald jemand wieder über
  ein Barrel importiert. Die Meldung nennt dann aber die falsche Datei (das
  Composable, nicht den Import). Der Architekturtest nennt die richtige Stelle
  mit Alternative, deshalb gibt es beides.

### 5. Ratchet zählt eindeutige Fehler

`scripts/quality-gate.mjs` verwendet dieselben Argumente wie `typecheck`
(`-b --noEmit`) und zählt eindeutige Tupel `(Datei, Zeile, Spalte, Code)`
statt Treffer von `error TS\d+`. Dateien unter `shared/` werden in zwei
Projekten geprüft, und ohne Deduplizierung würde jeder Fehler dort doppelt
zählen.

### 6. Die Umgehungen einzeln beheben, nicht pauschal

| Stelle | Ursache | Behebung |
|---|---|---|
| `extractPlainText` (2×) | AST untypisiert | Union-Typ `ContentAstNode` in `content-core/types` (Minimark-Tupel \| Knotenobjekt \| Textknoten) mit Typwächtern; unbekannte Knoten werden übersprungen |
| `repository.ts` `head` | `Record<string, any>` | Typ aus der generierten Collection übernehmen bzw. `Record<string, unknown>` |
| `ProsePre`/`ProseHeading` (4×) | `(t as any)(key, params)` | ohne Cast aufrufen; falls vue-i18n an der Überladung scheitert, den Schlüssel als Literal statt als `const key` übergeben |
| `NavigationBar` `localePath(… as any)` | `routeName: string` statt Routenname | `routeName` in `navItems` auf den typisierten Routennamen einengen |
| `ServerAddresses.vue` `@ts-ignore` | veraltet | Kommentar entfernen (`@vueuse/core` ist installiert) |
| `ProseImg.vue` `ufo` (TS2307) | transitive Abhängigkeit, unter pnpm nicht auflösbar | `ufo` als direkte Abhängigkeit aufnehmen; es wird direkt importiert, die Version folgt der von Nuxt |

Die übrigen App-Fehler (`LanguageSelector` 6×, `NavigationBar:72`,
`SocialMediaShare`, `useArticleSeo`, `usePageSeo`, `pages/index.vue`,
`eslint.config.mjs`) sind Einzelkorrekturen ohne Architekturfolgen. Die Regel
dafür: Typen enger machen oder `undefined` explizit behandeln, statt
Nicht-Null-Assertions (`!`) oder Casts einzufügen.

## Risks / Trade-offs

- **`vue-tsc -b` verlangt `composite` in referenzierten Projekten.** →
  `nuxi typecheck` verwendet genau diesen Aufruf gegen dieselben generierten
  Configs, das spricht dafür, dass er funktioniert. Die erste Task prüft es.
  Scheitert es, greift der Fallback aus Entscheidung 1 (vier `-p`-Läufe),
  ohne dass sich Specs oder übrige Tasks ändern.
- **Der Build-Modus schreibt `*.tsbuildinfo`.** → Die Ablage wird geprüft.
  Liegt sie außerhalb von `.nuxt/`, kommt sie in `.gitignore`.
- **Nach dem Umstellen der Server-Imports bleiben weitere Fehler im
  Server-Projekt übrig**, etwa weil `repository.ts` über
  `import type … from './collections'` Nuxt-Content-Konfigurationscode lädt.
  → Die Spec erlaubt Fehler nur in `server/`, `shared/` und Layer-Typdateien.
  Echte Funde werden behoben. Sollte ein Import aus `collections` die Ursache
  sein, bezieht `repository.ts` `Locale` aus `locales.ts`.
- **Veraltete Basis** (bei der Umsetzung festgestellt): Die Arbeit begann auf
  `feat/events-section`, 35 Commits hinter `origin/main`. → Per Patch auf
  `origin/main` übertragen; einziger Konflikt war `IconFa.vue`, dort gilt die
  Fassung von `main`. `add-events-section` ist auf `main` gemergt (#375), der
  Konflikt entfällt.
- **`ufo` als neue direkte Abhängigkeit.** → Das Paket ist schon installiert
  (transitiv über Nuxt), am Bundle ändert sich nichts. Die Alternative, die
  drei URL-Helfer nachzubauen, wäre schlechter.

## Migration Plan

Die Umstellung läuft in einem PR, der Ratchet ist das Sicherheitsnetz.
Reihenfolge: zuerst die Typ-Einstiege und die Architekturregel (bei
unverändertem `tsconfig`), dann die Umstellung auf `references`, die dann
schon mit wenigen Fehlern startet, danach die Einzelkorrekturen und am Ende
`pnpm quality:update`. Für einen Rollback reicht es, `tsconfig.json` und die
`typecheck`-Zeile zurückzusetzen. Laufzeit und Build sind nicht betroffen.
