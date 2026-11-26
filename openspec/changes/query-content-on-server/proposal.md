# Proposal: Content-Abfragen im Browser über den Server

Ausgeliefert als `perf(content)`.

## Why

Wer auf der Website per Klick zu einem Blogartikel wechselt (Client-
Navigation), lädt im Hintergrund eine ganze Datenbank: Gemessen am
2026-11-26 mit Chrome gegen Production (Startseite → Blog → Artikel) holte der
Browser

- `/_nuxt/sqlite3.*.wasm`: 865 KB,
- `/__nuxt_content/blog_en/sql_dump.txt`: 101 KB,
- `/__nuxt_content/team_en/sql_dump.txt`: 2 KB.

Grund: `@nuxt/content` v3 führt `queryCollection` im Browser über eine
WebAssembly-SQLite aus, die es beim ersten clientseitigen Zugriff auf eine
Collection lädt und mit deren SQL-Dump füllt. Auf dem Handy heißt das: rund
1 MB Download, WASM kompilieren und Dump einspielen, bevor der Artikel
erscheint. Das ist die teuerste Interaktion der Site (INP) und verbraucht
Datenvolumen. Beim ersten Seitenaufruf passiert es nicht, weil der Server
rendert und die Daten im Payload mitschickt.

Alle Abfragen laufen über eine Stelle: `useContentRepository()` erzeugt den
`ContentRepository`-Adapter (`nuxtContentAdapter.ts`). Dort lässt sich die
Abfrage im Browser durch einen Aufruf an den Server ersetzen, ohne Seiten oder
Composables zu ändern.

## What Changes

- **Server-Route für Content-Abfragen**: `server/api/content/[method].get.ts`
  (Name vorläufig) führt eine Methode des `ContentRepository` serverseitig
  aus (`queryCollection(event, …)` gegen D1) und liefert das Ergebnis als
  JSON. Nur die Methoden des Interfaces sind erlaubt; Argumente werden je
  Methode geprüft (Locale aus der festen Liste, Slugs als Strings mit
  Längengrenze, Listen mit Höchstzahl).
- **Client-Adapter**: Im Browser liefert `useContentRepository()` einen
  Adapter mit derselben Schnittstelle, der jede Methode per `$fetch` an die
  Route schickt. Auf dem Server bleibt der bisherige Adapter. Seiten,
  Composables und Komponenten bleiben unverändert.
- **Kein WASM, kein Dump im Browser**: Nach dem Change lädt keine
  Client-Navigation `sqlite3*.wasm` oder `/__nuxt_content/*/sql_dump.txt`.
  Wenn `@nuxt/content` eine dokumentierte Option bietet, die das Ausliefern
  der Client-Datenbank abschaltet, wird sie zusätzlich genutzt.
- **Edge-Cache für die Route**: Antworten der Content-Route werden wie die
  Seiten am Edge gecacht (gleiche Laufzeit wie `/en/**`), damit Navigation
  nicht bei jedem Klick D1 trifft.
- Nicht in diesem Change: Inhalte, Abfragelogik und Projektionen im Adapter,
  Payload-Größe beim ersten Aufruf, andere Performance-Themen.

## Capabilities

### Modified Capabilities
- `content-queries`: Abfragen aus dem Browser laufen über den Server.

## Impact

- `layers/content-core/composables/useContentRepository.ts`, neuer
  Client-Adapter unter `layers/content-core/utils/content/`, neue
  Server-Route unter `server/api/content/`, `routeRules` in `nuxt.config.ts`.
- Tests für Route (erlaubte Methoden, Argumentprüfung), Client-Adapter
  (gleiche Ergebnisse wie der Server-Adapter) und ein Architekturtest.
- Keine neuen Abhängigkeiten. Keine sichtbare Änderung.
