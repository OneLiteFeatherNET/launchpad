# Proposal: D1 beim Deploy befüllen, Integritätsprüfung zur Laufzeit abschalten

Ausgeliefert als `perf(content)`.

## Why

`@nuxt/content` 3.16.1 prüft auf Cloudflare D1 vor der ersten Abfrage jeder
Collection in einem frischen Worker-Isolate, ob die Datenbank zum Build passt
(`checkAndImportDatabaseIntegrity`, `runtime/internal/database.server.js`):
`SELECT * FROM _content_info WHERE id = 'checksum_<collection>'`, und bei
abweichender Prüfsumme importiert es den komprimierten Dump zur Laufzeit. Das
Ergebnis liegt nur im Speicher des Isolates. Jedes kalte Isolat zahlt deshalb
pro Collection einen zusätzlichen, sequenziellen D1-Roundtrip (rund 190 ms je
Collection im Produktions-Trace `26fde3e28efc6c5bad572786834653b7`; `/de`
gesamt 1,48 s). Der erste Request nach einem Deploy zahlt zusätzlich den
Dump-Import.

## What Changes

- Der Deploy schreibt die gebauten Dumps in D1, bevor die neue Worker-Version
  Verkehr bekommt (ein Skript, das die Dumps unter
  `.nuxt/content/raw/dump.<collection>.sql` dekomprimiert und per
  `wrangler d1 execute --remote` anwendet).
- `runtimeConfig.content.integrityCheck` wird in Produktion `false`; die
  Abfrage-Route überspringt die Prüfung dann (`runtime/api/query.post.js`).
- Ein Erkennungsmechanismus meldet einen fehlgeschlagenen oder ausgebliebenen
  Seed (Versions-Check nach dem Deploy).
- Nicht in diesem Change: Smart Placement, D1-Leserepliken (eigene PRs),
  Patch am Modul, Cache-Header, Schemaänderungen an Collections.

Dieser Change ist **nur Planung**; die Umsetzung folgt, sobald die offenen
Fragen in `design.md` geklärt sind.

## Capabilities

### New Capabilities

- `content-delivery`: wie Inhalte nach D1 gelangen und was ein Request zur
  Laufzeit dafür tun muss (nichts).

### Modified Capabilities

_Keine._

## Impact

- `nuxt.config.ts` (`runtimeConfig.content.integrityCheck`, nur
  Produktion), neues Skript unter `scripts/`, `package.json`-Skript,
  `AGENTS.md` (Abschnitt „Deploy“: neuer Deploy-Befehl) und die
  Workers-Builds-Einstellungen im Dashboard (nicht im Repository).
- Keine neuen Abhängigkeiten (`wrangler` läuft über `npx wrangler deploy`
  bereits im Deploy).
- Risiko: veraltete Inhalte, wenn der Seed ausfällt (siehe Design).
