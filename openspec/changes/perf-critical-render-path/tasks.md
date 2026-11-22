# Tasks

Messen zuerst, dann ändern. Tests nach F.I.R.S.T. (Budget-Tests lesen Dateien
des Builds oder des Repos, kein Server im Unit-Test). Branch von aktuellem
`origin/main`. Builds, Tests und Lighthouse laufen über `heavy`.

## 1. Ausgangsmessung und Spike

- [ ] 1.1 `NODE_ENV=production heavy pnpm build`, `pnpm preview:prod`; Lighthouse 12.8.2 Mobile (Standard-Drosselung) gegen `http://localhost:8787/en` und `/de`, je 5 Läufe, Median für Performance, FCP, LCP, TBT notieren; zusätzlich Desktop. Zahlen für die PR-Beschreibung sichern
- [ ] 1.2 Bundle-Analyse (`nuxi analyze`): Anteile am Entry-Chunk (Plugins, Module, i18n, Content-Client, FontAwesome) und die 48 modulepreload-Chunks einzeln auflisten, nach „für die erste Ansicht nötig“ sortieren
- [ ] 1.3 CSS-Spike: Varianten A, B, C aus `design.md` bauen; je `<link rel="stylesheet">`-Anzahl, Größe von `<style>` und HTML-Größe (roh und brotli) von `/en` festhalten; Entscheidung und HTML-Budget in `design.md` nachtragen

## 2. Kritisches CSS

- [ ] 2.1 `tests/performance/critical-css.spec.ts` (Build-Ausgabe lesen, überspringt ohne `.output`): `/en`-HTML enthält kein blockierendes Entry-Stylesheet-`<link>`. Rot sehen
- [ ] 2.2 Gewählte Variante in `nuxt.config.ts` umsetzen (`features.inlineStyles` und/oder `vitalizer`), Test aus 2.1 grün
- [ ] 2.3 Ungenutztes CSS verkleinern (`seasons.css`, Tailwind-`@source`, FontAwesome-Styles, Prose-Stile), jeder Schritt einzeln gemessen und nur bei Gewinn behalten. `assets/css/seasons.css` und den Block zwischen den `md3:generated`-Markern nur über `scripts/md3-tokens.mjs` ändern; `node scripts/md3-tokens.mjs --check` und `tests/design-system` grün
- [ ] 2.4 Screenshots vor/nach (mobil und desktop, hell und dunkel, `?season=winter` lokal) vergleichen; kein FOUC

## 3. JavaScript

- [ ] 3.1 `tests/performance/modulepreload-budget.spec.ts`: Obergrenze für `modulepreload`-Links in `/en` (Wert aus 1.2). Rot sehen
- [ ] 3.2 Preload über `build:manifest` auf die erste Ansicht beschränken; Test aus 3.1 grün
- [ ] 3.3 Entry-Chunk verkleinern nach den Befunden aus 1.2 (nicht-kritische Plugins auf Idle, weitere `Lazy…` mit `hydrate-on-…`, `manualChunks` nur bei sauberem Schnitt). Nach jeder Verschiebung `pnpm build` (Layer-`index.ts`-Wertexporte, Client-Bundle) und `pnpm exec vitest run tests/architecture`
- [ ] 3.4 Konsole im Produktions-Build auf Hydration-Warnungen prüfen (`/en`, `/de`, Blog, Events)

## 4. Abschluss

- [ ] 4.1 `heavy pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht); `.nuxtrc`-Änderungen nicht committen; Commits nur vom Typ `perf(build)`
- [ ] 4.2 Nachmessung wie 1.1 (gleicher Rechner, gleiche Läufe); Desktop-Performance bleibt mindestens 98; `node scripts/cache-check.mjs` und `pnpm seo:check -- --base http://localhost:8787 --no-mock` grün
- [ ] 4.3 Pull Request gegen `main` mit dem Titel `perf(build): inline critical css and trim the entry bundle` öffnen. Beschreibung auf Englisch, kurze Domain-Story (Problem: Seite erscheint auf dem Telefon spät; Ansatz; Vorher/Nachher-Tabelle aus 1.1 und 4.2, HTML-Zuwachs). Keine Session-Links oder Trailer
