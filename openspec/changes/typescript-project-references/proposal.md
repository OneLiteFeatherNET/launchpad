# Proposal: TypeScript-Projekte nach Nuxt 4 trennen und die Typgrenze zu Nitro erzwingen

## Why

`tsconfig.json` erweitert noch die Sammel-Config `.nuxt/tsconfig.json` aus der
Nuxt-3-Zeit. Nuxt 4 erzeugt längst vier getrennte Projekte (`app`, `server`,
`shared`, `node`), aber keins davon wird geprüft. Die Sammel-Config schließt
`../server` nicht aus. `server/` läuft also mit DOM-Lib und den Auto-Imports
der App durch den Typecheck, und `server/tsconfig.json` benutzt niemand. Die
AGENTS.md-Regel „Nitro erreicht keinen App-Code“ hält deshalb nur die
Konvention, der Compiler prüft sie nicht.

Eine Messung gegen die generierten Projekte (Stand 2026-09-23) zeigt, dass die
Regel heute schon verletzt wird:

- `.nuxt/tsconfig.server.json` meldet **78 Fehler**, alle in App-Code
  (`useEvents`, `useTeamRoster`, `useTeamProfile`, `useTeamFaqContent`,
  `usePageSeo`, `useBreadcrumbs`, `nuxtContentAdapter`). Die Ursache ist
  `import type { … } from '#layers/team'` bzw. `'#layers/events'` in
  `server/api/__sitemap__/*.ts`. Zur Laufzeit hat dieser Import keine Wirkung,
  aber er lädt das komplette Barrel `index.ts` und damit jedes Composable in
  das Typprogramm des Servers. Dasselbe gilt für `layers/team/types.ts` und
  `layers/events/types.ts`, die ihre Dokumenttypen über das Barrel
  `#layers/content-core` beziehen.
- `.nuxt/tsconfig.app.json` meldet dieselben **17 Fehler** wie der heutige
  `pnpm typecheck`. Der Override `verbatimModuleSyntax: false` wird also nicht
  gebraucht, weil unter Nuxts Standard `true` kein einziger Fehler hinzukommt.
- `shared` und `node` sind fehlerfrei.

Dazu kommen 9 ESLint-Befunde, die die Typprüfung gezielt umgehen (8×
`no-explicit-any`, 1× `ban-ts-comment`). Sie haben vier Ursachen: Der
Markdown-AST ist nicht typisiert (`extractPlainText`, 2×), das Feld `head` ist
als `Record<string, any>` deklariert (1×), und die i18n-Aufrufe werden an der
Schlüsseltypisierung von vue-i18n vorbeigecastet (`(t as any)` in `ProsePre`
und `ProseHeading` 4×, `localePath(… as any)` in `NavigationBar` 1×). Hinzu
kommt ein veraltetes `@ts-ignore` vor `@vueuse/core` in `ServerAddresses.vue`,
obwohl das Paket installiert ist.

Jetzt ist der richtige Zeitpunkt dafür: Der Diff berührt weder
`content.config.ts` noch die Datenpfade der laufenden Changes, und er ist die
Voraussetzung für den Folge-Change `content-schema-single-source`, nach dem
`vue-tsc` zum harten CI-Gate werden soll.

## What Changes

- `tsconfig.json` wird zur reinen Referenz-Config auf die vier Nuxt-Projekte.
  Der Override `verbatimModuleSyntax: false` und `server/tsconfig.json`
  entfallen.
- `pnpm typecheck` und `scripts/quality-gate.mjs` prüfen im Build-Modus
  (`vue-tsc -b --noEmit`) alle vier Projekte, so wie es `nuxi typecheck` tut.
  Fehler in Dateien, die zu mehreren Projekten gehören, zählen nur einmal.
- Jeder Layer bekommt mit `#layers/<name>/types` einen **reinen Typ-Einstieg**.
  Dieser importiert ausschließlich andere Typ-Einstiege und zieht keine
  Composables ins Programm. `content-core/types.ts` exportiert dafür auch die
  Dokumenttypen (`TeamDocument`, `EventDocument`, …).
- `tests/architecture/module-boundaries.spec.ts` erlaubt den Deep-Import
  `#layers/<name>/types`, aber nur als `import type`, und verlangt ihn für
  `server/` und für die `types.ts` der Layer.
- Die 14 App-Typfehler, die nicht auf Schema-Drift zurückgehen, werden behoben
  (`LanguageSelector`, `NavigationBar`, `SocialMediaShare`, `useArticleSeo`,
  `usePageSeo`, `ProseImg`, `pages/index.vue`, `eslint.config.mjs`).
- Die 9 Umgehungen verschwinden: `content-core` bekommt einen Typ für den
  Markdown-AST, `head` bekommt den Typ, den Nuxt Content liefert, die
  i18n-Aufrufe laufen ohne Cast, und das
  `@ts-ignore` entfällt. Danach melden `no-explicit-any` und
  `ban-ts-comment` im ganzen Quellbaum 0 Befunde.
- `quality-baseline.json` sinkt entsprechend (auf `origin/main`: `typeErrors`
  von 16 auf 3, `eslintErrors` um die behobenen Befunde).

## Nicht Teil dieses Changes

- Die drei Fehler aus Schema-Drift (`useHomeContent.ts:14/27`,
  `useCommunityPoi.ts:14`) und die handgeschriebenen `& { … }`-Erweiterungen
  der Dokumenttypen. Die kommen in `content-schema-single-source`, weil sie
  `content.config.ts` berühren, genau wie `add-events-section` und
  `edge-caching-and-seo`.
- Der Typecheck als hartes Gate. Er bleibt Teil des Ratchets, bis
  `typeErrors` bei 0 steht.
- ESLint-Stil (`max-len`, 270 Befunde) und das fehlende Ignore für
  `.claude/worktrees/`.
- Typisierte i18n-Schlüssel (`i18n.experimental.typedOptionsAndMessages`).
  Damit würde ein Tippfehler im Schlüssel zum Compilerfehler, aber dafür muss
  `nuxt.config.ts` geändert werden, und jeder dynamisch zusammengesetzte
  Schlüssel muss angepasst werden. Das bekommt einen eigenen Change.

## Capabilities

### New Capabilities
- `type-safety`: Welche TypeScript-Projekte das Repository prüft, wie der
  Typecheck gemessen wird und welche Typgrenzen zwischen App, Server, Shared
  und Layern der Compiler bzw. der Architekturtest erzwingt.

### Modified Capabilities
- keine

## Impact

- **Konfiguration:** `tsconfig.json`, `server/tsconfig.json` (entfällt),
  `package.json` (`typecheck`), `scripts/quality-gate.mjs`,
  `quality-baseline.json`.
- **Layer-Typen:** `layers/*/types.ts` (`content-core`, `team`, `events` und
  alle anderen, die über ein Barrel importieren).
- **Server:** `server/api/__sitemap__/team.ts` und `events.ts`, jeweils nur
  der `import type`-Pfad.
- **Tests:** `tests/architecture/module-boundaries.spec.ts`.
- **Komponenten/Composables:** die oben genannten Fehlerstellen, die
  `Prose*`-Komponenten in `content-core`, `NavigationBar.vue` und
  `ServerAddresses.vue`.
- **Dokumentation:** In AGENTS.md wird der Abschnitt „Nitro cannot reliably
  reach app code“ um den Typ-Einstieg ergänzt.
- **Laufzeitverhalten:** keine Änderung. Das Build-Ergebnis bleibt gleich,
  weil sich nur Typen, `import type`-Pfade und Tooling ändern.
- **Basis:** Die Messungen oben stammen von `feat/events-section`. Umgesetzt
  wird auf `origin/main` (`0218399`, Release 1.7.1), das `add-events-section`
  (#375) und die SEO-Korrekturen aus #350 schon enthält. Dort meldet der
  bisherige Typecheck 16 Fehler (Baseline). Zwei davon sind neu gegenüber der
  Messung: `defineOgImage('NuxtSeo', …)` in `useArticleSeo`/`usePageSeo`. Der
  bloße Name ist in den generierten Typen von nuxt-og-image mehrdeutig
  (satori/takumi). Der `SocialMediaShare`-Fehler existiert auf `main` nicht
  mehr.
