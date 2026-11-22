# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (Datei-Lesetests, kein Server).
Branch von aktuellem `origin/main`, das diesen Vorschlag enthält. Builds und
volle Testläufe über `heavy`: `heavy pnpm build`, `heavy pnpm test`.

## 1. Tabelle und Regeln

- [ ] 1.1 [Haiku] `tests/architecture/edge-cache-rules.spec.ts` auf die Tabelle aus `design.md` umstellen: 24-h-Routen, 1-h-Routen (nie 86400), Standardregel 3600, Rechtsseiten unverändert; Prüfung gegen die echte Nitro-Routenauflösung für `/en/blog` vs. `/en/blog/<slug>`. Rot sehen
- [ ] 1.2 [Haiku] `routeRules` in `nuxt.config.ts` anpassen (nur `cachedPageHeaders(86400)`-Zeilen und die Überschreibungen auf 3600, Kommentar knapp mit Verweis auf den Grund); Header-Helper unverändert; verifiziert durch grüne Tests aus 1.1
- [ ] 1.3 [Haiku] `tests/architecture/request-independent-render.spec.ts` unverändert grün; `AGENTS.md`/`CLAUDE.md` (Tabelle, Saison-Verzögerung) aktualisieren

## 2. Abschluss

- [ ] 2.1 [Haiku] `heavy pnpm test`, `heavy pnpm typecheck`, `heavy pnpm quality` (Baseline steigt nicht)
- [ ] 2.2 [Haiku] `NODE_ENV=production heavy pnpm build`, `pnpm preview:prod`; per `node scripts/cache-check.mjs` und `curl -I`: Artikel/Team 86400, Events/Home/Blog-Liste 3600, 404 `no-store`
- [ ] 2.3 [Haiku] `.nuxtrc`-Änderungen nicht committen; Commits nur vom Typ `perf(cache)`
- [ ] 2.4 [Haiku] Code-Pull-Request gegen `main` mit dem Titel `perf(cache): keep static pages edge-fresh for a day` öffnen; keine Datei unter `openspec/`. Beschreibung auf Englisch als kurze Domain-Story. Keine Session-Links oder Trailer
