# Proposal: Kritisches CSS inlinen und das Entry-Bundle verschlanken

Ausgeliefert als `perf(build)`. Pull-Request-Titel:
`perf(build): inline critical css and trim the entry bundle`

## Why

Messung vom 2026-11-22 (Lighthouse 12.8.2, `/en`): Desktop-Performance 99,
Mobile (Standard-Drosselung) nur **75** mit FCP 3,5 s, LCP 4,1 s und TBT
230 ms. Zwei Ursachen sind im Bericht eindeutig:

1. **Render-blockierendes CSS.** `/_nuxt/entry.*.css` ist 114 KB roh und
   blockiert den ersten Paint auf Mobil um etwa 450 ms. Der Browser malt
   nichts, bis diese Datei da ist, obwohl für die erste Bildschirmseite nur
   ein Bruchteil gebraucht wird (Tailwind-Utilities und die MD3-Rollen aus
   `assets/css/tailwind.css`/`tokens.css`/`seasons.css`, FontAwesome-
   Basisstile und alle Komponentenstile, die der Entry-Chunk mitzieht).
2. **Zu viel JavaScript im Einstieg.** Der Haupt-Chunk ist etwa 168 KB
   übertragen, davon rund 77 KB ungenutzt; dazu kommen 48
   `<link rel="modulepreload">` auf `/en`. Auf einem schwachen Telefon
   konkurrieren diese Downloads mit CSS und LCP-Bild und treiben die
   Hauptthread-Zeit (TBT).

Der Desktop-Lauf (CI-Gate) merkt davon nichts; Besucher auf Mobilgeräten
schon.

## What Changes

- **Kritisches CSS inlinen**: Der Weg wird zuerst in einem kurzen Spike
  festgelegt (siehe `design.md`, Entscheidung 1): zuerst Nuxts eingebautes
  `features.inlineStyles` und eigene Build-Hooks, dazu Prüfung, was Nuxt 4
  von den globalen `css:`-Einträgen tatsächlich inlined. `nuxt-vitalizer`
  nur als Rückfall, wenn die Messung den eingebauten Weg widerlegt. HTML-
  Zuwachs bis ca. 25 KB komprimiert pro Seite ist akzeptiert. Ziel: Die erste
  Bildschirmseite rendert ohne blockierenden Stylesheet-Request; das
  restliche CSS lädt nicht blockierend nach.
- **Ungenutztes CSS reduzieren**: den Tailwind-Quellscan und die in den
  Entry gezogenen Stile prüfen und, wo möglich, aus dem Entry heraus in
  seitenspezifische Chunks bewegen (z. B. `seasons.css` nur für aktive
  Saison, Prose/Code-Stile nur für Content-Seiten).
- **Entry-JS aufteilen**: Weniger Code im Entry-Chunk (Plugins prüfen,
  schwere Teile hinter `Lazy…`/`hydrate-on-…`, gezielte `manualChunks`).
- **modulepreload senken**: von 48 auf das, was die erste Ansicht braucht,
  über die Nuxt-Manifest-Hooks; der Rest lädt bei Bedarf.
- **Messen vorher/nachher** mit Lighthouse 12.8.2 (Mobile) gegen den lokalen
  Produktions-Build; die Zahlen stehen in der PR-Beschreibung.

Keine Änderung an Inhalt, Design oder URLs. Die Edge-Cache-Regeln bleiben
unberührt.

## Capabilities

### New Capabilities

- `render-performance`: Budgets für das, was den ersten Paint blockiert und
  was beim Einstieg geladen wird.

### Modified Capabilities

Keine.

## Impact

- `nuxt.config.ts` (`features`, `vitalizer`, `hooks`, `vite.build`)
- `assets/css/`, ggf. `plugins/fontawesome.ts`, Layer-Komponenten (nur
  Lazy-Umstellungen)
- `tests/performance/` (neue Budget-Tests)
- Keine neuen Abhängigkeiten geplant. Lighthouse 12.8.2 läuft nur lokal per
  `npx`, nicht im Repo.
- Risiken (Details in `design.md`): größere HTML-Antworten, Flash of
  unstyled content, Hydration-Fehler durch Lazy-Umstellungen, Verträglichkeit
  mit `layers/*/index.ts`-Wertexporten im Client-Bundle.
