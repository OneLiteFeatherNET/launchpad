# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (kein Server, Nitro-Globals
gestubbt). Branch von aktuellem `origin/main`.

## 1. Header

- [ ] 1.1 [Haiku] `tests/architecture/security-headers.spec.ts`: Werte (Referrer-Policy, nosniff, Permissions-Policy, `frame-ancestors`), Quellenliste der CSP, kein `report-uri`/`report-to`, Plugin setzt alle Header in `beforeResponse` und `error`, keine Cookie- oder Cache-Header. Rot sehen
- [ ] 1.2 [Haiku] `shared/utils/securityHeaders.ts` und `server/plugins/security-headers.ts` anlegen; verifiziert durch grüne Tests aus 1.1

## 2. Prüfung

- [ ] 2.1 [Haiku] `NODE_ENV=production pnpm build`, Vorschau auf Port 8800; per `curl` Header auf `/en`, `/en/imprint`, `/`, einer 404-Seite prüfen
- [ ] 2.2 [Haiku] Chromium über `/en`, `/de`, Blog, Artikel, `/en/bluemap`, Events, Team, Community laden, Konsole auf CSP-Verstöße prüfen; Policy anpassen, bis sauber

## 3. Abschluss

- [ ] 3.1 [Haiku] `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht)
- [ ] 3.2 [Haiku] `.nuxtrc`-Änderungen nicht committen; Commits nur vom Typ `feat(security)`
- [ ] 3.3 [Haiku] Pull Request gegen `main` mit dem Titel `feat(security): send baseline security headers and a report-only csp` öffnen. Beschreibung auf Englisch als kurze Domain-Story, keine Session-Links oder Trailer
