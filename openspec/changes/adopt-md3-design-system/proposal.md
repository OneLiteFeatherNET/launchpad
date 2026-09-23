# Proposal: Material Design 3 als Designsystem mit wiederverwendbaren Primitives

## Why

Die Oberfläche entsteht heute pro Komponente aus frei kombinierten
Tailwind-Utilities. Eine Zählung über alle 73 `.vue`-Dateien (Stand
2026-09-23) zeigt, was das kostet:

- 383 Rohfarben aus `neutral`/`gray`/`slate`/`zinc`, dazu 69
  `white/<n>`- bzw. `black/<n>`-Alphawerte und 351 `dark:`-Varianten – jede
  Komponente löst Hell/Dunkel selbst, und `tests/design-system/contrast.spec.ts`
  dokumentiert bereits einen Kontrastfehler, der nur in einem Theme auftrat.
- Sechs Radius-Stufen (`rounded-full` bis `rounded-sm`) und acht
  Schatten-Stufen ohne Bedeutung dahinter; 25 `class`-Attribute sind länger als
  250 Zeichen.
- 17 rohe `<button>` in 9 Dateien und mehrere handgebaute Link-Buttons
  (z. B. `OpenPositionCard.vue`), jeweils mit eigenem Fokus-, Hover- und
  Dunkelmodus-Verhalten.
- Wiederverwendung gibt es kaum: `Chip` und `SectionHeading` werden in 9 Dateien
  genutzt, Karten (`ArticleCard`, `TeamMemberCard`, `CommunityPoiCard`,
  `OpenPositionCard`, `ServerAddressCard`) sind jeweils Einzelanfertigungen.

Material Design 3 liefert genau das fehlende Vokabular: Farb*rollen* statt
Farbwerten (mit garantiertem Kontrast in Hell und Dunkel), eine benannte
Typo-, Shape-, Elevation- und State-Layer-Skala sowie ein kleines Set
Komponenten-Varianten. `Chip` (`tonal`/`elevated`/`outlined`) und
`NavigationIconButton` (`standard`/`filled`/`tonal`/`outlined`) benennen ihre
Varianten schon nach MD3 – nur ohne das Token-Fundament darunter.

## What Changes

- **MD3-Farbrollen als Tailwind-Tokens.** Ein Generator erzeugt mit dem
  offiziellen MD3-Algorithmus (HCT) aus den Kernfarben `#2A388F` (primary),
  `#27A9E1` (secondary) und `#EC008B` (tertiary) ein helles und ein dunkles
  Schema; Orange und Violett kommen als Custom Colors dazu. Das Ergebnis steht
  als `light-dark()`-Werte statisch im `@theme`-Block von
  `assets/css/tailwind.css` (`bg-primary`, `text-on-surface`,
  `bg-surface-container-high`, …). Die Optik verschiebt sich dadurch leicht.
- **MD3-Skalen für Typografie, Shape, Elevation, State Layer, Fokus und
  Motion** als `@theme`-Tokens bzw. `@utility`-Klassen
  (`text-title-medium`, `rounded-large`, `shadow-elevation-1`,
  `state-layer`, `focus-ring`).
- **Primitive-Bibliothek im `base`-Layer** mit `M3`-Präfix: `M3Button`,
  `M3IconButton`, `M3Card`, `M3Chip`, `M3Divider`, `M3LinearProgress`.
  **BREAKING (intern):** `Chip` und `NavigationIconButton` gehen in `M3Chip`
  bzw. `M3IconButton` auf und werden entfernt.
- **Migration aller Layer-Komponenten, Seiten, Layouts und `error.vue`** auf
  Rollen-Tokens und Primitives, domänenweise in eigenen Pull Requests.
- **Architekturtests als Leitplanke**: Rohfarben, farbige `dark:`-Varianten,
  Nicht-MD3-Radien/-Schatten und gestylte rohe `<button>` außerhalb des
  `base`-Layers schlagen fehl; eine nur schrumpfende Ausnahmeliste trägt die
  noch nicht migrierten Dateien.
- **Entfernen der Alt-Tokens** nach der Migration: `--color-bg`, `--color-text`,
  `--color-muted`, `--color-border`, die numerische `brand-50…900`-Skala und
  `secondary-*`. **BREAKING (intern)** für jeden, der sie noch nutzt.
- Aktualisierung des Skills `tailwind-design`, dessen Token-Vertrag sich
  grundlegend ändert.

Nicht Teil dieses Changes: ein Theme-Umschalter, Web-Fonts (es bleibt der
System-Font-Stack), Formularfelder, Menüs/Dialoge, eine Umgestaltung der
Seitenlayouts sowie `components/OgImage/*` (Satori rendert ohne CSS-Variablen).

## Capabilities

### New Capabilities
- `design-tokens`: MD3-Farbrollen, Typo-, Shape-, Elevation-, State-Layer-,
  Fokus- und Motion-Tokens, ihre Erzeugung aus den Markenfarben und ihr
  Verhalten in Hell- und Dunkelmodus.
- `ui-primitives`: Die wiederverwendbaren `M3*`-Komponenten im `base`-Layer,
  ihre Varianten, Zustände und Barrierefreiheitsgarantien.
- `design-system-governance`: Die automatisch geprüften Regeln, die festlegen,
  wo Stilentscheidungen stehen dürfen, und wie die Migration messbar
  abgeschlossen wird.

### Modified Capabilities
- keine (unter `openspec/specs/` existiert noch keine Capability)

## Impact

- **Code**: `assets/css/tailwind.css`, `assets/css/tokens.css`,
  `layers/base/components/*`, alle Komponenten unter `layers/*/components/`,
  `pages/**`, `layouts/**`, `error.vue`, `app.vue` (`theme-color`-Metas).
- **Tests**: neue Specs unter `tests/design-system/`; `brand-scale.spec.ts`
  entfällt mit der Skala, `dead-color-tokens.spec.ts` und
  `contrast.spec.ts` werden erweitert, Komponententests für die Primitives.
- **Dependencies**: `@material/material-color-utilities` als
  **devDependency**, ausschließlich vom Generator-Skript genutzt; nichts davon
  landet im Client- oder Server-Bundle.
- **Dokumentation**: `.claude/skills/tailwind-design/SKILL.md`, `AGENTS.md`
  (Abschnitt zu UI-Primitives).
- **Qualitätsgates**: Lighthouse-Accessibility (≥ 0,9) und die
  Quality-Ratchet dürfen sich nicht verschlechtern; jeder Migrations-PR braucht
  Screenshots in Hell und Dunkel.
