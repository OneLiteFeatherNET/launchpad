# Tasks

Ein Pull Request, Merge vor dem 20. Oktober. Vor dem PR gilt: `pnpm test`,
`pnpm build` und `pnpm quality` grün; Screenshots von Start-, Blog-, Team-
und POI-Seite hell/dunkel mit und ohne `?season=halloween` im PR.

## 1. Saison-Farben im Generator

- [x] 1.1 `scheme()` in `scripts/md3-tokens.mjs` auf Seeds parametrisieren (Primär, Sekundär, Tertiär) und `generateTokens(seeds, customColors)` daraus ableiten, Basis-Aufruf unverändert; verifiziert durch `node scripts/md3-tokens.mjs --check` ohne Abweichung am bestehenden Block
- [x] 1.2 Register `SEASONS` mit Halloween-Seeds aus design.md D1 anlegen und `renderSeasonBlock(id)` schreiben, das alle Rollen und Custom Colors als `html[data-season="halloween"] { … }` ausgibt; verifiziert durch einen Unit-Test, der für jede Rolle des Basis-Schemas eine Deklaration im Saison-Block findet
- [x] 1.3 Deko-Farben außerhalb der Rollen nach design.md D3 im Saison-Block erzeugen (`--brand-magenta`, `--brand-cyan`, vier `--gradient-*`; ursprünglich Alt-Token-Brücke, beim Rebase auf den fertig migrierten `main` reduziert); verifiziert durch Test, dass jede `--brand-*`/`--gradient-*`-Deklaration aus `tailwind.css` genau eine Zeile hat
- [x] 1.4 Generator schreibt bzw. prüft (`--check`) zusätzlich `assets/css/seasons.css` komplett mit Kopfkommentar „do not edit“; `tailwind.css` importiert sie direkt nach `@import 'tailwindcss'`; verifiziert durch `pnpm build` und eine Stichprobe `html[data-season=halloween]` mit `--color-primary` im erzeugten CSS
- [x] 1.5 `md3-tokens.spec.ts` um die Aktualitätsprüfung für `seasons.css` erweitern (Fehlermeldung nennt Saison und Rolle); verifiziert durch einen absichtlich von Hand geänderten Saisonwert, der den Test mit Saison- und Rollennamen scheitern lässt, und zurück

## 2. Kontrast und Farbwirkung

- [x] 2.1 Helfer `seasonCss(id)` in `tests/helpers/theme.ts` ergänzen und `contrast.spec.ts` die `ROLE_PAIRS` zusätzlich für jede Saison in beiden Schemata prüfen lassen, Fehlermeldung mit Saison, Paar, Schema und Wert; verifiziert durch grünen Lauf und einen absichtlich zu hellen Seed, der rot wird
- [x] 2.2 Test für die Halloween-Farbwirkung: Farbton `primary` 260°–300°, `secondary` 20°–45° in beiden Schemata, Luminanz der hellen `surface` > 0,8; bei Verstoß Seeds in `SEASONS` nachjustieren; verifiziert durch grünen Test

## 3. Saison-Layer

- [x] 3.1 `layers/season/` mit `nuxt.config.ts`, `types.ts` (`Season`, `ActiveSeason`, `SeasonDay`) und `index.ts` anlegen; verifiziert durch grüne `module-boundaries.spec.ts` und `layer-name-collisions.spec.ts`
- [x] 3.2 `layers/season/utils/seasons.ts` mit Register (Halloween 20.10.–2.11., `themeColor` = Saison-`surface`, Logo- und Favicon-Pfad, `decor: true`) und reinem `resolveSeason` nach design.md D4, übernommen aus `feat/seasonal-theming` und an die Layer-Struktur angepasst; verifiziert durch `tests/season/resolve-season.spec.ts` mit allen Kalender- und Override-Szenarien aus beiden Specs (inkl. 19.10. 22:30 UTC, 2.11. 23:00, 3.11. 00:30, Jahreswechsel, `none`, Tippfehler)
- [x] 3.3 Test, dass jede Saison im Layer-Register einen Block in `seasons.css` hat und umgekehrt, und dass `themeColor` dem Saison-`surface` entspricht; verifiziert durch grünen Test
- [x] 3.4 `runtimeConfig.public.season: ''` in `nuxt.config.ts` (Standard und Produktionszweig) ergänzen und `layers/season/composables/useSeason.ts` mit `useState` und der Reihenfolge Query → Runtime-Config → Kalender schreiben; verifiziert durch einen Composable-Test mit gemocktem `useRoute`/`useRuntimeConfig` — beim Rebase geändert: `useSeason` liest nur Runtime-Config und Kalender; `?season=` wertet `layers/season/plugins/season-preview.client.ts` nach der Hydration aus (design.md D4a), getestet über `previewSeason` in `resolve-season.spec.ts`

## 4. Verdrahtung in App und Layout

- [x] 4.1 `app.vue`: `data-season` in `htmlAttrs` (fehlt ohne Saison), `BASE_THEME_COLOR` als Konstante, `theme-color` aus der Saison, genau ein `rel="icon"` und `mask-icon` aus Saison oder Basis; `md3-tokens.spec.ts` liest die Konstante statt der Meta-Literale; verifiziert durch grünen Test und `curl -s 'localhost:3000/?season=halloween'` mit `data-season="halloween"`, Saison-`theme-color` und genau einem Icon-Link im HTML
- [x] 4.2 `NavigationBar` bekommt das optionale Prop `logoSrc` (Default `images/logo.svg`), `layouts/default.vue` übergibt das Saison-Logo; verifiziert durch Komponententest (Default und Override, Alternativtext unverändert) und `module-boundaries.spec.ts` grün
- [x] 4.3 `layouts/default.vue`: `<Body>` von `dark:bg-gray-900` auf `bg-surface` umstellen (design.md D7) und den Eintrag im Governance-Test bzw. MD3-Task 11.3 nachziehen; verifiziert durch `md3-governance.spec.ts` grün und Screenshot Dunkelmodus mit und ohne Saison — beim Rebase entfallen: `main` setzt `bg-surface` bereits (MD3-Migration #370)
- [x] 4.4 Hydration prüfen: Seite mit `?season=halloween` bei auf den 1. Januar gestellter Browser-Uhr (Playwright `clock`) laden; verifiziert durch unveränderten Skin nach Hydration und keine Hydration-Warnung in der Konsole

## 5. Deko

- [x] 5.1 `--animate-season-drift` in `@theme` und `@keyframes season-drift` (nur `transform`) in `tailwind.css` ergänzen; verifiziert durch `utility-classes.spec.ts` grün
- [x] 5.2 `layers/season/components/SeasonDecor.vue` nach design.md D6 (Spinnennetze, max. drei Fledermäuse ab `md`, `aria-hidden`, `pointer-events-none`, `fixed z-30`, Rollenfarben mit Deckkraft, `motion-reduce:hidden`) und in `app.vue` einbinden; verifiziert durch Komponententest (kein DOM ohne Saison, Attribute und Klassen vorhanden, höchstens drei Fledermäuse) und `md3-governance.spec.ts` ohne neue Ausnahme
- [x] 5.3 Deko im Browser prüfen: 390 px nur Netze, 1280 px Netze und Fledermäuse, Klick auf einen Nav-Link unter einem Netz funktioniert, geöffnetes Mobile-Menü liegt über der Deko, `prefers-reduced-motion` ohne Bewegung, keine zusätzlichen Requests im Network-Tab; verifiziert per Playwright-Screenshots im PR

## 6. Logo und Favicon

- [x] 6.1 Halloween-Logo aus `public/images/logo.svg` ableiten (Markenform erhalten, Halloween-Farben, ein Motiv), mit SVGO optimieren und unter `public/images/seasons/halloween/logo.svg` ablegen; verifiziert durch Sichtprüfung neben dem Original im PR
- [x] 6.2 Vereinfachtes Halloween-Favicon unter `public/images/seasons/halloween/favicon.svg`; verifiziert durch Screenshot des Browser-Tabs bei 16 px und Sichtprüfung
- [x] 6.3 Test, dass beide Assets existieren, gültiges SVG sind und höchstens so groß wie ihr Basis-Asset; verifiziert durch grünen Test

## 7. Abstimmung und Abschluss

- [x] 7.1 In `openspec/changes/adopt-md3-design-system/design.md` das Non-Goal „keine Laufzeit-Themes“ präzisieren (kalendergesteuerte Saisons aus demselben Generator erlaubt, keine Nutzerwahl) und in D2 auf `seasons.css` als Ausnahme für reine Overrides verweisen; in Task 12.1 den Hinweis ergänzen, dass die Alt-Token-Brücke im Generator mit entfällt; verifiziert durch Review, dass beide Changes einander nicht widersprechen — der Hinweis zu Task 12.1 entfiel beim Rebase, weil 12.1 auf `main` bereits erledigt ist
- [x] 7.2 `.claude/skills/tailwind-design/SKILL.md` und `AGENTS.md` um einen kurzen Abschnitt „Saisons“ ergänzen (Seeds im Generator, `seasons.css` nie von Hand, `?season=`, Notschalter); verifiziert durch Review
- [x] 7.3 Gesamtprüfung: `pnpm test`, `pnpm build`, `pnpm quality` (kein gestiegener Wert) und Lighthouse (Desktop, Accessibility ≥ 0,9) auf Start- und Blogseite mit `?season=halloween`, zusätzlich mobile Performance manuell mit und ohne Saison vergleichen; Ergebnis im PR dokumentieren
