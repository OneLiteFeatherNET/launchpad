# Spec Delta

## Purpose

Die Doku, die Agenten vor SEO-Arbeit lesen, stimmt mit dem installierten und
verdrahteten Stand überein.

## ADDED Requirements

### Requirement: Keine Aussage über nicht existierende Patches
`AGENTS.md` MUST NOT behaupten, ein Modul sei gepatcht, wenn weder
`patches/` noch ein Patch-Eintrag in `pnpm-workspace.yaml` existiert.

#### Scenario: nuxt-schema-org
- **WHEN** `AGENTS.md` gelesen wird
- **THEN** steht dort nicht, dass `nuxt-schema-org` gepatcht ist
- **AND** es gibt kein Verzeichnis `patches/`

### Requirement: Der Skill beschreibt die Root-WebSite-Identität
Die Skill-Referenz `schema-org-and-site-identity.md` MUST beschreiben, welche
Datei den WebSite-Knoten setzt, dass seine `@id` und `url` auf dem Domain-Root
liegen, und dass kein zweiter `defineWebSite`-Aufruf hinzukommen darf. Sie
MUST NOT behaupten, `nuxtSiteConfig.description` fehle in den Locale-Dateien.

#### Scenario: Agent fügt Schema hinzu
- **WHEN** ein Agent die Referenz vor einer Änderung an Schema.org liest
- **THEN** findet er den Pfad `layers/content-core/plugins/site-identity.server.ts` und die Regel „ein WebSite-Knoten“
