# Tasks

Jede Aufgabe folgt Rot → Grün. Commits unter `perf(content): …`, Tests im
selben Commit wie der Code. Vor Beginn sind die offenen Fragen aus
`design.md` mit der Maintainer:in geklärt.

## 1. Klärung (vor jedem Code)

- [ ] 1.1 Dump-Format und -Pfad gegen einen echten `pnpm build` verifizieren (`.nuxt/content/raw/dump.<collection>.sql`, Dekompression, Hash-Suffix, `_content_info`-Zeilen) und in `design.md` festhalten
- [ ] 1.2 Prüfen, ob `NUXT_CONTENT_INTEGRITY_CHECK=false` auf Workers greift; sonst festen Wert in `$production` verwenden
- [ ] 1.3 Dashboard-Einstellungen (Deploy-/Nicht-Produktions-Befehl, Token-Rechte für D1) mit der Maintainer:in abstimmen; Entscheidung zu Vorschau-D1 (D4) festhalten

## 2. Seed-Skript

- [ ] 2.1 Test (`tests/scripts/`, ohne Netzwerk, `wrangler`-Aufruf injiziert): Skript dekomprimiert Dumps, erzeugt je Datei einen `d1 execute --remote --file`-Aufruf, bricht bei Fehler mit Exit-Code ≠ 0 ab und seedet nie außerhalb des Produktionszweigs; rot sehen
- [ ] 2.2 `scripts/seed-d1.mjs` und `pnpm deploy:production` umsetzen; verifiziert durch grüne Tests

## 3. Laufzeit

- [ ] 3.1 Test: Produktions-Konfiguration setzt `runtimeConfig.content.integrityCheck` auf `false`, Entwicklung nicht; rot sehen
- [ ] 3.2 `nuxt.config.ts` anpassen; verifiziert durch grüne Tests und `pnpm build`

## 4. Erkennung

- [ ] 4.1 Test: Versions-Endpunkt liefert Prüfsummen je Collection und wird nicht gecacht; rot sehen
- [ ] 4.2 Endpunkt und Nachprüf-Schritt bzw. Workflow umsetzen; verifiziert durch grüne Tests

## 5. Dokumentation und Messung

- [ ] 5.1 `AGENTS.md` „Deploy“ um neuen Deploy-Befehl, Rollback-Weg und Zweischritt-Regel für Strukturänderungen ergänzen
- [ ] 5.2 Trace vor und nach dem Deploy vergleichen (siehe Design, „Messung“), Zahlen in `design.md` und in die PR-Beschreibung übernehmen
- [ ] 5.3 `pnpm test`, `pnpm quality`, `pnpm typecheck` und `pnpm build` laufen grün; Baseline nicht erhöht
- [ ] 5.4 Pull Request gegen `main` mit dem Titel `perf(content): seed d1 at deploy and skip the runtime integrity check` öffnen (Beschreibung: Problem, Ansatz, Messung, Dashboard-Änderungen, Link auf diesen Ordner)
