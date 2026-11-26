# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `perf(content): …`, Tests im selben Commit wie der Code,
den sie treiben.

## 1. Klärung und Ausgangsmessung

- [ ] 1.1 Doku der installierten `@nuxt/content`-Version prüfen: Option für Server-Abfragen oder zum Abschalten der Client-Datenbank? Ergebnis festhalten und Vorgehen danach ausrichten
- [ ] 1.2 Vorher messen nach `design.md` („Messung“): Requests und Bytes bei Navigation zu Artikel und Event

## 2. Server-Route

- [ ] 2.1 Tests: erlaubte Methode liefert das Ergebnis des Server-Adapters; unbekannte Methode 404; ungültige Argumente 400; rot sehen
- [ ] 2.2 Route mit Methodenliste und zod-Schemas umsetzen; grün
- [ ] 2.3 Test: Antwort trägt die Edge-Cache-Header der Seiten, nicht `no-store`; rot sehen; `routeRules` ergänzen; grün

## 3. Client-Adapter

- [ ] 3.1 Test: Client-Adapter ruft für jede Methode die Route mit stabilen Argumenten und liefert dieselben Werte (inkl. Datumswerte) wie der Server-Adapter; rot sehen
- [ ] 3.2 Adapter umsetzen und in `useContentRepository()` im Browser verwenden; grün
- [ ] 3.3 Architekturtest: Kein Client-Code ruft `queryCollection` außerhalb des Server-Adapters

## 4. Messung und Abschluss

- [ ] 4.1 Nachher messen: keine `sqlite3*.wasm`- und `sql_dump.txt`-Requests bei Navigation, Inhalt identisch zum direkten Aufruf; Screenshots vorher/nachher ohne Pixelabweichung; Zahlen in die PR-Beschreibung
- [ ] 4.2 `pnpm test`, Quality-Gate, `pnpm typecheck` und `pnpm build` laufen grün
- [ ] 4.3 Pull Request `perf(content): query content through the server on client navigation` öffnen
