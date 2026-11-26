# Spec Delta

## ADDED Requirements

### Requirement: Der Browser fragt Content über den Server ab
Im Browser MUST jede Methode des `ContentRepository` ihr Ergebnis von einer
Server-Route beziehen. Der Browser MUST NOT die SQLite-WebAssembly von
`@nuxt/content` oder einen SQL-Dump unter `/__nuxt_content/` laden. Auf dem
Server MUST der bisherige Adapter unverändert gegen die Datenbank abfragen.

#### Scenario: Navigation zu einem Blogartikel
- **WHEN** jemand auf `/en` lädt, zur Blogübersicht und dann per Klick zu einem Artikel wechselt
- **THEN** lädt der Browser weder `sqlite3*.wasm` noch `/__nuxt_content/*/sql_dump.txt`
- **AND** der Artikel erscheint mit demselben Inhalt wie beim direkten Aufruf

#### Scenario: Gleiches Ergebnis wie auf dem Server
- **WHEN** eine Repository-Methode im Browser und auf dem Server mit denselben Argumenten aufgerufen wird
- **THEN** sind beide Ergebnisse gleich, einschließlich Datumswerten und fehlender Felder

### Requirement: Die Content-Route nimmt nur bekannte Abfragen an
Die Route MUST nur Methodennamen des `ContentRepository` annehmen und MUST
die Argumente je Methode prüfen. Unbekannte Methoden MUST mit 404, ungültige
Argumente mit 400 beantwortet werden.

#### Scenario: Unbekannte Methode
- **WHEN** `/api/content/dropTables` aufgerufen wird
- **THEN** antwortet die Route mit 404

#### Scenario: Ungültige Locale
- **WHEN** `listBlogArticles` mit der Locale `fr` aufgerufen wird
- **THEN** antwortet die Route mit 400

### Requirement: Antworten der Content-Route werden am Edge gecacht
Antworten der Content-Route MUST dieselben Edge-Cache-Header tragen wie die
Seiten unter `/en/**` und `/de/**` und MUST NOT unter die
`no-store`-Regel für `/api/**` fallen.

#### Scenario: Cache-Header
- **WHEN** `/api/content/listBlogArticles` erfolgreich antwortet
- **THEN** trägt die Antwort `cloudflare-cdn-cache-control` mit `max-age=3600`
