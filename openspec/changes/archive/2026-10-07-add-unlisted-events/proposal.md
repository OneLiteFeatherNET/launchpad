# Proposal: Nicht gelistete Events, nur per Link erreichbar

Ausgeliefert als `feat(events)`.

## Why

Manche Events sollen nur Leute erreichen, denen das Team den Link gibt, etwa
eine ausführliche Seite mit Anleitung zum Halloween-Modus (Slender), die
Discord oder Tester schon vor der offiziellen Ankündigung lesen sollen. Heute
entscheidet allein der Zeitplan über die Sichtbarkeit: Vor `announceAt`
antwortet die Detailseite mit 404, danach steht das Event überall. Einen
Zustand „erreichbar, aber nicht öffentlich“ gibt es nicht.

## What Changes

- **Neues optionales Frontmatter-Feld `unlisted: true`** für Events,
  Standard `false`. Das Verhalten öffentlicher Events bleibt unverändert.
- **Ein nicht gelistetes Event ist per Link immer erreichbar**, unabhängig
  vom Zeitplan: vor `announceAt`, während der Ankündigung, während es läuft
  und nach `endsAt`.
- **Ein nicht gelistetes Event erscheint nirgends von selbst**: nicht in der
  Übersicht `/<locale>/events`, nicht im Startseiten-Carousel (auch nicht mit
  `promote`) und nicht in der Sitemap. Seine Detailseite trägt `noindex`.
- **Vorschau vor der Ankündigung**: Eine nicht gelistete Detailseite in der
  Phase *verborgen* zeigt statt eines Phasen-Chips einen Vorschau-Hinweis mit
  Startzeitpunkt, in beiden Sprachen.
- **Inhaltsprüfung**: `unlisted: true` zusammen mit einem `promote`-Objekt
  ist ein Widerspruch und lässt die Frontmatter-Prüfung fehlschlagen.
- Nicht in diesem Change: der Slender-Event-Inhalt selbst. Er folgt als
  eigener Change, sobald die Spielregeln vorliegen.

## Capabilities

### New Capabilities

_Keine._

### Modified Capabilities

- `events`: Die Sichtbarkeit eines Events hängt künftig zusätzlich von
  `unlisted` ab. Das betrifft die Anforderungen an verborgene Events, die
  Übersicht, das Carousel und die Sitemap. Die Capability entsteht mit
  `add-events-section`, das vor diesem Change archiviert werden muss.

## Impact

- `content.config.ts` (`eventsSchema`), `tests/content/events-frontmatter.spec.ts`
- `shared/utils/eventPhase.ts` und `eventRoutes.ts` (Sichtbarkeitsregel und Sitemap-Quelle)
- `server/api/__sitemap__/events.ts`
- `layers/events`: `utils/eventLists.ts`, `composables/useEvents.ts`,
  `types.ts`, `components/EventPhaseChip.vue`
- `pages/events/[...slug].vue` (`noindex`, Vorschau-Hinweis)
- `i18n/locales/{de,en}.json` (Vorschau-Texte)
- Keine neuen Abhängigkeiten, keine Migration. Bestehende Events haben das
  Feld nicht und bleiben öffentlich.
