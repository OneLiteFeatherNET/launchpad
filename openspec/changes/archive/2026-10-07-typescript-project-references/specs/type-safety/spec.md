# Spec Delta: type-safety

## Purpose

Legt fest, welche TypeScript-Projekte das Repository prüft, wie das Ergebnis
gemessen wird und welche Typgrenzen zwischen App-, Server- und Shared-Code
sowie zwischen den Domänen-Layern maschinell erzwungen werden. Grenzen, die
bisher nur als Konvention in AGENTS.md standen, sollen damit vom Compiler
oder vom Architekturtest geprüft werden.

## ADDED Requirements

### Requirement: Der Typecheck prüft App, Server, Shared und Node getrennt
Der Typecheck des Repositorys MUST jede Quelldatei in der Umgebung prüfen, in
der sie ausgeführt wird: App-Code mit Browser-Umgebung und den Auto-Imports
der App, Server-Code mit der Nitro-Umgebung und den Auto-Imports des Servers,
Shared-Code ohne die Auto-Imports einer der beiden Seiten, Konfigurationsdateien
mit der Node-Umgebung. Er SHALL alle vier Umgebungen in einem Lauf prüfen und
mit einem Fehlercode enden, sobald eine davon einen Fehler meldet.

#### Scenario: Server-Code benutzt ein App-Composable
- **WHEN** eine Datei unter `server/` ein Composable aufruft, das nur auf der App-Seite automatisch importiert wird (z. B. `useI18n`)
- **THEN** meldet der Typecheck einen Fehler in dieser Datei

#### Scenario: Server-Code benutzt eine DOM-API
- **WHEN** eine Datei unter `server/` auf `window` oder `document` zugreift
- **THEN** meldet der Typecheck einen Fehler in dieser Datei

#### Scenario: Shared-Code benutzt ein App-Composable
- **WHEN** eine Datei unter `shared/utils/` ein nur in der App verfügbares Composable aufruft
- **THEN** meldet der Typecheck einen Fehler in dieser Datei

#### Scenario: Fehler in nur einer Umgebung
- **WHEN** App, Shared und Node fehlerfrei sind und der Server einen Fehler hat
- **THEN** endet der Typecheck mit einem Fehlercode ungleich 0

### Requirement: Nuxts Compiler-Standards werden nicht abgeschwächt
Das Repository MUST die von Nuxt erzeugten Compiler-Optionen `strict`,
`noUncheckedIndexedAccess` und `verbatimModuleSyntax` unverändert übernehmen.
Eine Abschwächung SHALL nur mit einer Begründung im Kommentar direkt an der
überschreibenden Stelle zulässig sein.

#### Scenario: Typ ohne `type`-Modifier importiert
- **WHEN** eine Datei ein Interface mit `import { SomeInterface } from '…'` statt `import type` importiert
- **THEN** meldet der Typecheck einen Fehler in dieser Datei

### Requirement: Jeder Layer hat einen reinen Typ-Einstieg
Jeder Layer unter `layers/<name>/` MUST seine öffentlichen Typen über einen
Typ-Einstieg `#layers/<name>/types` anbieten. Jeder Import in den Typdateien
eines Layers (`types*.ts`) SHALL ein `import type` sein und nur aus eigenen
Typdateien des Layers, aus Typ-Einstiegen anderer erlaubter Layer oder – nur im
Layer `content-core` – aus `@nuxt/content` bzw. aus dessen eigenen
`utils/content/`-Modulen stammen. Lokal definierte Literal-Konstanten, aus
denen Typen abgeleitet werden (z. B. `EVENT_PHASES`), sind erlaubt, da sie kein
Modul laden. Der Einstieg MUST ohne das Laden eines Composables, einer
Komponente oder eines Barrels `index.ts` auflösbar sein.

#### Scenario: Typ-Einstieg importiert ein Barrel
- **WHEN** `layers/team/types.ts` einen Typ aus `#layers/content-core` statt aus `#layers/content-core/types` importiert
- **THEN** schlägt der Architekturtest fehl und nennt die Datei und den Importpfad

#### Scenario: Typ-Einstieg enthält einen Wert-Import
- **WHEN** eine Typdatei eines Layers `import { X } from '…'` ohne `type` enthält
- **THEN** schlägt der Architekturtest fehl

#### Scenario: Typ aus einer Konstanten abgeleitet
- **WHEN** ein Layer-Typ aus einer Konstanten eines anderen Layers abgeleitet wird (z. B. `typeof STATUS_ORDER[number]`)
- **THEN** geschieht das über `import type` und der Architekturtest bleibt grün

### Requirement: Typ-Imports über Layer-Grenzen nutzen nur den Typ-Einstieg oder das Barrel
Ein Deep-Import in einen fremden Layer MUST auf `#layers/<name>/types` beschränkt
sein und SHALL nur als `import type` erlaubt sein. Alle anderen Deep-Imports
(`#layers/<name>/composables/…`, `~/layers/<name>/…` usw.) bleiben verboten;
davon ausgenommen sind nur die im Architekturtest namentlich registrierten
Ausnahmen.

#### Scenario: Wert-Import über den Typ-Einstieg
- **WHEN** eine Datei `import { something } from '#layers/team/types'` ohne `type` schreibt
- **THEN** schlägt der Architekturtest fehl

#### Scenario: Deep-Import in ein Composable
- **WHEN** eine Datei `import type { X } from '#layers/team/composables/useTeamRoster'` schreibt
- **THEN** schlägt der Architekturtest fehl

### Requirement: Server-Code zieht keinen App-Code ins Typprogramm
Dateien unter `server/` MUST Typen aus Layern ausschließlich über den
Typ-Einstieg `#layers/<name>/types` importieren, nie über das Barrel
`#layers/<name>`. Der Typecheck der Server-Umgebung SHALL keine Fehler in
Dateien melden, die außerhalb von `server/`, `shared/` und den Typdateien der
Layer liegen.

#### Scenario: Sitemap-Route importiert Dokumenttypen
- **WHEN** `server/api/__sitemap__/team.ts` den Typ `TeamDocument` benötigt
- **THEN** importiert es ihn per `import type` aus `#layers/team/types`, und das Typprogramm des Servers enthält kein Composable aus `layers/*/composables/`

#### Scenario: Server importiert über das Barrel
- **WHEN** eine Datei unter `server/` `import type { X } from '#layers/events'` schreibt
- **THEN** schlägt der Architekturtest fehl und nennt den Typ-Einstieg als Alternative

### Requirement: Typecheck und Quality-Ratchet messen dasselbe
Der Quality-Ratchet MUST die Typfehler mit demselben Umfang zählen wie
`pnpm typecheck`. Eine Datei, die zu mehreren Projekten gehört, SHALL mit
jedem Fehler (Datei, Zeile, Spalte, Code) nur einmal gezählt werden.

#### Scenario: Gleiche Zahl in beiden Werkzeugen
- **WHEN** `pnpm typecheck` auf einem frisch vorbereiteten Stand N eindeutige Fehler meldet
- **THEN** zählt `pnpm quality` für `typeErrors` ebenfalls N

#### Scenario: Datei in zwei Projekten
- **WHEN** eine Datei unter `shared/` sowohl im App- als auch im Shared-Projekt geprüft wird und einen Fehler enthält
- **THEN** erhöht sie `typeErrors` um genau 1

### Requirement: Die Typprüfung wird nicht umgangen
Quellcode unter `layers/`, `pages/`, `layouts/`, `components/`, `server/` und
`shared/` MUST ohne `any` und ohne `@ts-ignore`/`@ts-nocheck` auskommen.
`@ts-expect-error` SHALL nur mit einer Begründung im selben Kommentar zulässig
sein. Übersetzungs- und Routing-Funktionen aus `@nuxtjs/i18n` (`t`,
`localePath`) MUST ohne Cast der Funktion oder ihrer Argumente aufgerufen
werden.

#### Scenario: Lint über den Quellbaum
- **WHEN** ESLint über das Repository läuft (ohne `.claude/worktrees/`)
- **THEN** meldet es keinen Befund der Regeln `@typescript-eslint/no-explicit-any` und `@typescript-eslint/ban-ts-comment`

#### Scenario: Übersetzung mit Parametern
- **WHEN** eine Komponente eine Übersetzung mit benannten Parametern abruft (z. B. `t('content.file', { filename })`)
- **THEN** kompiliert der Aufruf ohne `as`-Cast auf `t` oder das Ergebnis

### Requirement: Der Markdown-AST ist typisiert
Code, der den von Nuxt Content gelieferten Markdown-AST (Seitenkörper und
Excerpt) liest oder rendert, MUST gegen einen benannten AST-Typ arbeiten, der
beide gelieferten Formate (Minimark-Tupel und Knotenobjekte) abdeckt.

#### Scenario: Unbekannter Knotentyp
- **WHEN** der AST einen Knoten enthält, den der Code nicht kennt
- **THEN** zwingt der Typ den Code zu einer expliziten Behandlung (Überspringen oder Fallback), statt den Knoten ungeprüft als bekannt zu behandeln
