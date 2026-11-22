# Proposal: Statische Seiten einen Tag lang im Edge-Cache halten

Ausgeliefert als `perf(cache)`. Pull-Request-Titel des Code-PRs:
`perf(cache): keep static pages edge-fresh for a day`

## Why

`/en/**` und `/de/**` sind heute eine Stunde frisch (`max-age=3600`,
`stale-while-revalidate=86400`). Cache-Treffer starten den Worker nicht; jeder
Ablauf nach einer Stunde kostet also einen Render. Der Worker läuft heute mit
rund 2.040 Aufrufen pro Tag, CPU p50 14,5 ms, p99 457 ms. Der teure Teil ist
der Ausreißer-Render, nicht der Durchschnitt. Der Inhalt ist pro Build
statisch (D1 wird aus den Build-Dumps gefüllt); nur wenige Seiten hängen zur
Laufzeit von der Uhrzeit ab. Für alle anderen ist eine Stunde unnötig kurz.

Das `/`-Locale-Redirect läuft inzwischen als Cloudflare-Redirect-Regel vor dem
Worker; die Nuxt-Route `/` bleibt als Fallback.

## What Changes

- Inventar der zeitabhängigen Ausgabe (siehe `design.md`) und darauf
  aufbauend zwei TTL-Klassen: **24 h** für Seiten ohne Uhrzeitabhängigkeit,
  **1 h** für alle, die davon abhängen.
- Die Standardregel `/en/**` und `/de/**` bleibt bei 1 h (neue Seiten sind
  damit sicher kurz); statische Bereiche werden gezielt auf 24 h gehoben.
- Kein Purge-Schritt im Deploy: Workers Cache schlüsselt nach Worker-Version,
  jedes Deployment startet mit leerem Cache (Beleg in `design.md`).
- `tests/architecture/edge-cache-rules.spec.ts` bildet die neue Tabelle ab;
  `request-independent-render.spec.ts` bleibt grün und unverändert.

Nicht Teil: `/`, `/ingest/**`, `/__nuxt_content/**`, `/api/**` (bleiben
`no-store`), Fehlerantworten (bleiben ungecacht), Nitro `swr`/`cache`.

## Capabilities

### New Capabilities

- `edge-caching`: welche Route-Klasse wie lange im Edge-Cache frisch bleibt.

### Modified Capabilities

Keine (der ältere Change `edge-caching-and-seo` ist archiviert; seine Regeln
für Header-Form und `no-store` gelten unverändert weiter).

## Impact

- `nuxt.config.ts` (`routeRules`), `tests/architecture/edge-cache-rules.spec.ts`
- `AGENTS.md` / `CLAUDE.md`: Tabelle und Hinweis zur Verzögerung bei
  Saisonwechsel aktualisieren
- Sichtbare Folge: Saisonwechsel und Footer-Jahr erscheinen auf 24-h-Seiten
  bis zu einen Tag später (siehe Risiken in `design.md`)
- Keine neuen Abhängigkeiten, keine Secrets, keine Dashboard-Änderung
