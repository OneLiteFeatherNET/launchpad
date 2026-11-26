# Design: Content-Abfragen im Browser über den Server

## Leitplanken

- Optisch kein Unterschied, keine Abstriche für Besucher: Navigation muss
  mindestens so schnell reagieren wie heute bei warmem Cache und deutlich
  schneller beim ersten Wechsel zu einem Artikel.
- Erst die Doku von `@nuxt/content` (installierte Version, Context7 oder
  `node_modules/@nuxt/content`) prüfen: Gibt es eine dokumentierte Option,
  die Client-Abfragen an den Server leitet oder die Client-Datenbank
  abschaltet, wird sie bevorzugt und der eigene Adapter entfällt oder wird
  schlanker. Keine undokumentierten Schalter.

## Ablauf

1. Seite wird serverseitig gerendert: Server-Adapter, unverändert.
2. Client-Navigation: `useAsyncData` ruft eine Repository-Methode; im Browser
   ist das der Fetch-Adapter → `GET /api/content/<method>?args=<json>` →
   Server-Adapter gegen D1 → JSON.
3. Ergebnis landet wie bisher im `useAsyncData`-State.

`GET` statt `POST`, damit der Edge-Cache greift. Argumente als ein
JSON-Query-Parameter in fester Reihenfolge, damit gleiche Abfragen gleiche
URLs haben.

## Sicherheit

- Erlaubt sind nur die Methodennamen des `ContentRepository`; alles andere
  → 404.
- Argumente je Methode mit zod geprüft (zod ist vorhanden): Locale ∈
  `de`/`en`, Slugs und Übersetzungsschlüssel als Strings bis 200 Zeichen,
  Slug-Listen bis 50 Einträge. Ungültig → 400.
- Die Route liefert nur, was die Seiten ohnehin rendern; der Adapter filtert
  wie heute (`path`/`stem` entfernt, Projektionen).

## Cache

`routeRules['/api/content/**']` mit derselben Edge-Laufzeit wie die Seiten
(`cachedPageHeaders(3600)`); die Regel muss spezifischer sein als die
bestehende `'/api/**': no-store`. Prüfen, dass Nitro die spezifischere Regel
anwendet (Test auf die gemergten Header).

## Messung

- Vorher/Nachher mit Chrome (Playwright, System-Chrome
  `/usr/bin/google-chrome-stable`), Navigation Startseite → Blog → Artikel
  und Startseite → Events → Event: Liste der Requests, übertragene Bytes,
  Zeit vom Klick bis zur sichtbaren Überschrift.
- Lokal gegen `pnpm build` + `wrangler --cwd .output dev`; Production-Werte
  oben in `proposal.md`. Workers-Previews liegen hinter Cloudflare Access und
  sind nicht messbar.

## Risiken

- Ein Request pro Abfrage statt lokaler Abfrage: Bei mehreren Abfragen pro
  Seite parallel ausführen (geschieht durch `useAsyncData` ohnehin).
- Abweichende Ergebnisse zwischen Client- und Server-Adapter: Test, der für
  jede Methode beide Wege mit denselben Daten vergleicht.
- Datumswerte und `undefined` überleben JSON nicht gleich: Rückgabetypen
  prüfen (`pubDate` etc.) und Test auf identische Werte nach dem Fetch.
