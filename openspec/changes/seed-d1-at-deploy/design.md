# Design: D1 beim Deploy befüllen

## Context

Motivation: siehe `proposal.md`. Anforderungen: siehe
`specs/content-delivery/spec.md`. Deploy-Ablauf laut `AGENTS.md` („Deploy“):
Cloudflare Workers Builds baut und deployt per `npx wrangler deploy` auf dem
Produktionszweig `main`; die Befehle stehen im Dashboard, nicht im
Repository. Es gibt keine `wrangler.toml`; Nitro erzeugt die Konfiguration aus
`nuxt.config.ts` (D1-Binding `DB`, Datenbank `launchpad`).

## Befunde zum Modul (3.16.1, im Quelltext nachgelesen)

- **Dumps entstehen beim Build.** Für jede nicht private Collection schreibt
  das Cloudflare-Preset `<buildDir>/content/raw/dump.<collection>.sql`
  (`collectionDumpTemplate`, `module.mjs` ~1643). Trotz der Endung ist es kein
  SQL-Text, sondern `compress(JSON.stringify(Statements[]))`. Die Dateien gehen
  als öffentliche Assets ins Worker-Bundle und werden zur Laufzeit als
  `/__nuxt_content/<collection>/sql_dump.txt` ausgeliefert;
  `decompressSQLDump` im Runtime-Code macht daraus wieder Statements. Ein
  Seed-Skript muss dieselbe Dekompression nutzen (Format am Anfang der
  Umsetzung gegen einen echten Build verifizieren, nicht raten).
- **Jedes Statement endet auf ` -- <hash>`**; der Runtime-Import überspringt
  bekannte Hashes und löscht verschwundene (Delta-Import, nur wenn die
  Struktur-Prüfsumme gleich bleibt). Das Skript soll Struktur, Zeilen und
  `_content_info`-Prüfsumme so schreiben wie dieser Import.
- **Das Modul kennt einen Build-Zeit-Pfad, aber nur für NuxtHub**
  (`hub.db.applyMigrationsDuringBuild`, `module.mjs` ~2961–2985): Er schreibt
  `db/queries/content-database-NNN.sql` (beginnt mit
  `DROP TABLE IF EXISTS _content_info;`) und setzt dabei
  `runtimeConfig.content.integrityCheck = false`. Das Repo nutzt NuxtHub nicht;
  der Pfad dient als Vorlage, nicht als Lösung.
- **Schalter.** Standard ist `integrityCheck: true` (`module.mjs` 3316). Die
  Abfrage-Route prüft `useRuntimeConfig().content.integrityCheck` und überspringt
  `checkAndImportDatabaseIntegrity` bei `false` (`runtime/api/query.post.js`).
  Nitro erlaubt das Überschreiben bestehender Runtime-Config-Schlüssel über
  `NUXT_CONTENT_INTEGRITY_CHECK=false`; ob das auf Workers (Vars zur Laufzeit)
  greift, ist in der Umsetzung zu prüfen. Sicherer ist ein fester Wert in
  `nuxt.config.ts` unter `$production`.

## Goals / Non-Goals

**Goals:**
- Kein D1-Roundtrip für die Integritätsprüfung in kalten Isolaten.
- Kein Dump-Import zur Laufzeit; der erste Request nach dem Deploy ist nicht
  langsamer als jeder andere.
- Ein fehlgeschlagener Seed fällt auf, bevor Besucher veraltete Seiten sehen.

**Non-Goals:** Smart Placement, Leserepliken, Modul-Patch, Caching.

## Decisions

### D1: Der Seed läuft im Deploy-Befehl von Workers Builds
Der Deploy-Befehl im Dashboard wechselt von `npx wrangler deploy` zu
`pnpm deploy:production` (Skript: Seed, dann `npx wrangler deploy`). Der Build
ist dann fertig, die Dumps liegen im Build-Verzeichnis (Pfad gegen den echten
Build bestätigen). Vorschau-Builds nutzen den Nicht-Produktions-Befehl von
Workers Builds und dürfen nie seeden (D4).

Das Skript ruft `wrangler d1 execute launchpad --remote --file <sql>` je Dump
auf. Datenbankname und -ID stehen in `nuxt.config.ts`; das Skript liest sie
von dort, damit sie nicht doppelt gepflegt werden.

**Verworfen:** D1-Migrationen (`wrangler d1 migrations apply`): Inhalte sind
keine Schema-Migrationen, sie ändern sich bei jedem Build, Migrationen laufen
nur einmal. **Verworfen:** Seed nach dem Deploy (D3).

### D2: Delta statt Drop and Reload
Der Seed wendet denselben Delta-Import an wie das Modul, nicht `DROP TABLE` und
Neuaufbau: Ein Neuaufbau hinterlässt ein Fenster ohne Daten, in dem lebende
Isolate leere Collections lesen. Der Delta-Import setzt eine unveränderte
Struktur voraus; eine Strukturänderung ist der gefährliche Fall (D3).

### D3: Reihenfolge und Atomarität

| Reihenfolge | Fenster | Folge |
|---|---|---|
| Seed, dann Deploy | alte Version liest neue Daten | harmlos bei kompatiblen Inhalten; bei Strukturänderung (Spalten) können alte Abfragen fehlschlagen |
| Deploy, dann Seed | neue Version liest alte Daten | Inhalt kurz veraltet; bei Strukturänderung scheitern die neuen Abfragen; ein fehlgeschlagener Seed ist erst nach dem Deploy sichtbar |

Empfehlung: **Seed, dann Deploy**. Die alte Version ist nach dem Deploy binnen
Sekunden ersetzt, und der Edge-Cache hängt an der Worker-Version
(`nuxt.config.ts`, Kommentar zu Workers Cache): Die alte Version bedient ihren
eigenen Cache, die neue beginnt leer. Ein Seed-Fehler bricht den Deploy ab,
bevor irgendein Besucher etwas sieht.

Wichtige Falle: Hat die **alte** Version die Prüfung noch eingeschaltet,
importiert ein kaltes altes Isolat bei Prüfsummen-Abweichung seinen (alten)
Dump und überschreibt damit die frisch geseedeten Daten. Das betrifft genau
den ersten Deploy mit diesem Change (und Vorschauen, D4); danach hat keine
Produktionsversion die Prüfung mehr an. Strukturänderungen an
`content.config.ts` brauchen Zweischritt-Deploys (erst additiv, dann
aufräumen); das gehört in `AGENTS.md`.

**Rollback.** Ein Wrangler-Rollback tauscht nur den Code, nicht die Daten.
Für Inhaltsänderungen ist das tolerierbar (neuere Inhalte, älterer Code), für
Strukturänderungen nicht. Rollback-Weg: Commit revertieren und über den
normalen Weg deployen (Seed läuft mit), statt `wrangler rollback`.

### D4: Vorschau-Deployments teilen sich eine D1
Alle Vorschauen und die Produktion nutzen dieselbe Datenbank-ID. Heute
importiert eine Vorschau mit eingeschalteter Prüfung ihren Dump (mit Löschen
verschwundener Zeilen) in die Produktions-D1 — ein bestehendes Risiko, das dieser
Change nicht verursacht. Optionen: (a) Prüfung nur in Produktion aus,
Vorschauen behalten Prüfung und Risiko; (b) eigene Vorschau-D1, die beim
Vorschau-Build geseedet wird (sauber, aber zusätzliches Binding im
Nicht-Produktions-Build und Verwaltungsaufwand). Offene Frage 2.

### D5: Fehlererkennung
- Der Seed-Schritt bricht den Deploy ab, wenn `wrangler d1 execute`
  fehlschlägt: kein Deploy mit veralteten Daten. Das ist die wichtigste
  Absicherung und ein Grund für Seed-vor-Deploy.
- Nach dem Deploy liefert ein Endpunkt unter `server/` (z. B.
  `/api/_content-version`, nicht gecacht, nur `import type` aus `~/`) die
  Prüfsummen aus `_content_info`; ein Nachprüf-Schritt oder ein geplanter
  GitHub-Workflow vergleicht sie mit dem Build.
- Alarm: fehlgeschlagener Build in Workers Builds (GitHub-Check am Commit) und
  der Workflow bei Abweichung.

### D6: Fehlende Daten sind ein harter Fehler
Ohne Prüfung importiert niemand fehlende Daten nach. Eine frische D1 oder eine
nie geseedete Collection liefert leere Ergebnisse oder SQL-Fehler. Das ist
gewollt (laut statt stillschweigend veraltet) und wird durch D5 abgefangen.
Lokale Entwicklung und `pnpm preview` behalten die Prüfung (nur `$production`
schaltet ab).

## Alternativen

- **Prüfung behalten, alle Collections in einer Abfrage am Isolat-Start.**
  Reduziert N sequenzielle Roundtrips auf einen, braucht aber einen Modul-Patch
  (`pnpm patch`) oder Upstream-PR; Wartungslast bei jedem Modul-Update, der
  verbleibende Roundtrip pro kaltem Isolat bleibt. Rückfall, falls der
  Deploy-Befehl nicht änderbar ist.
- **Smart Placement / D1-Leserepliken.** Verkürzen den Weg zu D1, ändern aber
  nicht die Anzahl der Roundtrips; ergänzend, eigene PRs.
- **Nichts tun.** ~190 ms je Collection pro kaltem Isolat bleiben. Die meisten
  Treffer kommen aus dem Edge-Cache, aber jeder Deploy leert ihn, und jeder
  Cache-Miss auf ein kaltes Isolat zahlt.

## Messung

Vorher/Nachher mit dem Trace-Verfahren von `26fde3e…`:
1. Kaltes Isolat erzwingen (neue Worker-Version), `/de` und `/en` mit
   wechselndem Query-Parameter abrufen, damit der Edge-Cache nicht trifft.
2. Erfolg: keine `SELECT … _content_info`-Spans mehr; D1-Spans nur für echte
   Abfragen; Gesamtzeit von `/de` im kalten Isolat sinkt um etwa die Summe der
   Prüf-Roundtrips (Ziel: mindestens Anzahl Collections × 150 ms). Der erste
   Request nach dem Deploy liegt im Bereich der folgenden.
3. Workers-Dashboard: p50/p95 der Wall Time und Zahl der D1-Abfragen je
   Request, eine Woche vorher und nachher.

## Risks / Trade-offs

- Ein fehlgeschlagener oder übersprungener Seed zeigt veraltete Inhalte (D5).
- Der Deploy-Befehl liegt im Dashboard, nicht im Repository: Abweichungen sind
  nicht per Review sichtbar; `AGENTS.md` dokumentiert den Soll-Zustand.
- Der erste Deploy mit diesem Change hat das Überschreib-Fenster aus D3.
- Der Deploy wird länger und das Build-Token braucht D1-Schreibrechte.

## Open Questions

1. Darf der Deploy-Befehl im Dashboard auf `pnpm deploy:production` geändert
   werden, und hat das Token von Workers Builds D1-Schreibrechte?
2. Vorschau-D1 (D4 b) oder Vorschauen behalten die Prüfung (D4 a)?
3. Ist ein geplanter GitHub-Workflow als Nachprüfung gewünscht, oder reicht
   der Abbruch des Deploys bei Seed-Fehler?
4. Zweischritt-Regel für Strukturänderungen akzeptabel?
