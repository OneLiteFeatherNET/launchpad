# Design: Material Design 3 als Designsystem

## Context

Motivation und Zahlen: siehe `proposal.md` – Why. Anforderungen: siehe
`specs/design-tokens`, `specs/ui-primitives`, `specs/design-system-governance`.

Randbedingungen aus dem Bestand, die den Ansatz formen:

- **Tailwind v4, CSS-first.** Der `@theme`-Block in `assets/css/tailwind.css`
  ist die einzige Token-Quelle; es gibt keine `tailwind.config`. Jeder
  `--color-*`-Eintrag erzeugt Utilities. Farbneutrale Tokens nutzen schon
  `light-dark()`, `:root` trägt `color-scheme: light dark`.
- **Tests lesen `tailwind.css` direkt.** `dead-color-tokens.spec.ts`,
  `brand-scale.spec.ts` und `utility-classes.spec.ts` parsen `--color-*` und
  `--animate-*` aus genau dieser Datei.
- **`dead-color-tokens.spec.ts` verbietet heute ausdrücklich** ein
  `--color-secondary` und jede Klasse `bg-primary`/`text-secondary`. Der Grund
  war: diese Namen stammten aus einer nie geladenen `tailwind.config.mts` und
  waren tot. MD3 braucht genau diese Namen als echte Rollen – der Test und der
  Skill `tailwind-design` kodieren eine Entscheidung, die dieser Change bewusst
  umkehrt.
- **Layer-Regeln.** `base` darf nichts importieren, Komponenten-Namen tragen
  kein Layer-Präfix und dürfen nicht kollidieren
  (`layer-name-collisions.spec.ts`). `unused-components.spec.ts` lässt keine
  unbenutzte Komponente zu – ein Primitive muss mit seinem ersten Nutzer
  zusammen landen.
- **Heutige Primitives** im `base`-Layer: `Chip` (genutzt in 5 Dateien),
  `NavigationIconButton` (u. a. `NavigationBar`, `Carousel`), `CopyButton`,
  `SectionHeading`, `GradientText`, `IconFa`. Die Tag-Auflösung
  „`to` → NuxtLink, `href` → a, sonst button“ steht bisher nur in `Chip.vue`.
- **Keine Web-Fonts**, Icons über Font Awesome (`IconFa`,
  `fontawesome-registry.spec.ts`).

## Goals / Non-Goals

**Goals:**
- Stilentscheidungen (Farbe, Form, Typo, Zustand) wandern aus den
  Domänenkomponenten in Tokens und Primitives; Domänenkomponenten setzen nur
  noch Layout und Inhalt.
- Jede Migrationsstufe ist ein eigenständig mergebarer PR mit grünem CI.
- Der Fortschritt ist an einer schrumpfenden Liste ablesbar.

**Non-Goals:**
- Keine Laufzeit-Themes (Dynamic Color aus Wallpaper/Nutzerwahl), kein
  Theme-Umschalter, keine Kontraststufen „medium/high“.
- Keine vollständige MD3-Komponentenabdeckung – nur, was die Website heute
  braucht (siehe `specs/ui-primitives`). Menü, Dialog, Textfeld, Navigation
  Rail folgen bei Bedarf in eigenen Changes.
- Kein Pixel-genaues Nachbauen der MD3-Referenz-Implementierung.

## Decisions

### D1 – MD3 als Tokens in Tailwind, keine Komponentenbibliothek
Entschieden mit dem Nutzer. `@material/web` bringt Custom Elements mit
Shadow DOM (SSR-Hydration, Styling nur über CSS-Variablen, Tailwind greift
nicht hinein); Vuetify konkurriert mit Tailwind um das Styling und wäre die
größte Dependency des Projekts. Eigene Primitives über Tokens halten das
Bundle klein und bleiben im bestehenden Tailwind-Workflow.

### D2 – Token-Erzeugung: Generator-Skript mit statischem Ergebnis
`scripts/md3-tokens.mjs` nutzt `@material/material-color-utilities`
(devDependency) und schreibt die Farbrollen zwischen die Marker
`/* md3:generated:start */` und `/* md3:generated:end */` im `@theme`-Block von
`tailwind.css`. Mit `--check` vergleicht es nur und endet mit Code ≠ 0 bei
Abweichung; ein Vitest-Test ruft die Erzeugungsfunktion direkt auf, damit
`pnpm test` im CI die Aktualität prüft.

- **Schema-Aufbau:** `DynamicScheme` mit Variante *Fidelity* und
  Kontraststufe 0, `primaryPalette`/`secondaryPalette`/`tertiaryPalette` je aus
  der eigenen Kernfarbe (`#2A388F`, `#27A9E1`, `#EC008B`), Neutral-Paletten aus
  der Primärfarbe. *Fidelity* hält `primary-container` nah an der Kernfarbe –
  die Marke bleibt erkennbar, statt wie bei *Tonal Spot* zu entsättigen.
- **Custom Colors:** Orange und Violett über `customColor(..., { blend: false })`
  → Tokens `brand-orange`, `on-brand-orange`, `brand-orange-container`,
  `on-brand-orange-container` (Violett analog). Ohne Harmonisierung, weil es
  Markenfarben sind.
- **Format:** jede Rolle als `--color-<rolle>: light-dark(#hell, #dunkel);`.
- **Alternativen:** Werte einmalig im Material Theme Builder erzeugen und von
  Hand einfügen – nicht reproduzierbar, Änderungen der Kernfarben wären
  wieder Handarbeit. Laufzeit-Erzeugung im Client – kostet Bundle und CPU für
  ein Ergebnis, das sich nur mit einem Deploy ändert.
- **Warum im `@theme`-Block statt eigener Datei:** Die Tests und der Skill
  verankern `tailwind.css` als einzige Token-Quelle; ein zweiter Ort würde
  jede Prüfung verdoppeln.

### D3 – Namensraum: MD3-Rollennamen direkt, Alt-Tokens befristet daneben
`--color-primary`, `--color-surface-container-high` usw. ohne Präfix, damit
Klassen wie in der MD3-Dokumentation lesen (`bg-primary text-on-primary`).
`dead-color-tokens.spec.ts` wird im selben PR umgebaut: statt „`primary` darf
es nicht geben“ gilt „jede Farbklasse muss auf einen definierten Token zeigen“
(Governance-Spec, letzte Requirement).

Konflikte mit dem Bestand:
- `--color-surface` existiert schon (`bg-surface`, `ring-offset-surface`) und
  bekommt den MD3-Wert. Hell `#ffffff` → MD3-Surface (leicht getönt), dunkel
  `#11162a` → MD3-Surface. Bewusst hingenommen; Screenshots im PR.
- `--color-bg`, `--color-text`, `--color-muted`, `--color-border`,
  `brand-50…900`, `secondary-*`, `brand-primary/…` bleiben bis zum letzten PR
  bestehen, damit nicht migrierte Dateien unverändert rendern.
- `secondary-cyan` & Co. kollidieren nicht mit `secondary-container`, weil
  Tailwind vollständige Token-Namen auflöst.

Alternative: Präfix `md-` (`bg-md-primary`). Verworfen – dauerhaft längere
Klassen für einen Konflikt, der nach der Migration nicht mehr existiert.

### D4 – Nicht-Farb-Skalen als Theme-Namespaces bzw. `@utility`
- **Typografie:** `--text-<rolle>-<größe>` mit `--line-height`,
  `--font-weight` und `--letter-spacing`-Untervariablen (Tailwind v4 liest
  alle vier), Werte aus der MD3-Typeskala → `text-title-medium`.
  `SectionHeading` bekommt eine `level`-abhängige Stilzuordnung
  (h1 → `headline-large`, h2 → `headline-medium`, …).
- **Shape:** `--radius-extra-small` … `--radius-extra-large` → `rounded-small`.
  Tailwinds eigene `xs/sm/md/lg/xl` bleiben unangetastet (Spec verbietet
  Umdefinieren), sonst änderten sich nicht migrierte Dateien stillschweigend.
- **Elevation:** `--shadow-elevation-1` … `-5` mit den MD3-Schattenwerten.
  Flächenhierarchie läuft primär über `surface-container-*`, Schatten nur für
  `elevated`-Varianten.
- **Motion:** `--ease-standard`, `--ease-emphasized` (+ `-accelerate`,
  `-decelerate`); Dauern als dokumentierte Konvention (`duration-150`,
  `duration-300`), weil Tailwind v4 keinen Dauer-Namespace hat. Die globale
  Reduced-Motion-Regel in `tokens.css` deckt alles ab.
- **State Layer:** `@utility state-layer` legt über `background-image` eine
  `color-mix()`-Schicht aus `currentColor` mit `--state-opacity` (0/8/10/10 %)
  über den Hintergrund; `:disabled`/`[aria-disabled=true]` setzen 0 %. Kein
  Pseudo-Element, damit Primitives `::before`/`::after` frei behalten (Touch
  Target, s. u.) und kein `position: relative` erzwungen wird.
- **Fokus:** `@utility focus-ring` = `focus-visible:outline-3
  outline-offset-2 outline-secondary`. Ersetzt die bisherigen
  `focus-visible:ring-2 ring-[var(--color-brand-secondary)]`-Kombinationen.
- **Touch Target:** `@utility touch-target` erweitert die Trefferfläche über
  ein zentriertes `::after` auf min. 48 × 48 px.

### D5 – Primitives: `M3`-Präfix, Varianten als typisierte Klassen-Maps
- **Namen:** `M3Button`, `M3IconButton`, `M3Card`, `M3Chip`, `M3Divider`,
  `M3LinearProgress`. `Button`/`Card` wären ohne Layer-Präfix global,
  kollidieren mit HTML-Elementnamen (`vue/no-reserved-component-names`) und
  sagen nicht, welchem System sie folgen.
- **Typen zuerst** (AGENTS.md): `layers/base/types.ts` exportiert
  `ButtonVariant`, `IconButtonVariant`, `CardVariant`, `ChipKind`, `M3Color`
  (`primary | secondary | tertiary | error | brand-orange | brand-purple`).
- **Composable** `layers/base/composables/useInteractiveTag.ts`: die
  Tag-Auflösung aus `Chip.vue` (NuxtLink/a/button, `type="button"`,
  `rel` bei externem `target="_blank"`), von Button, IconButton, Chip und
  Card gemeinsam genutzt.
- **Varianten:** `Record<Variant, string>`-Konstanten mit vollständigen
  Klassen-Strings in `layers/base/utils/`, damit Tailwinds Scanner sie findet
  (keine zusammengesetzten Klassennamen). Keine `cva`/`tailwind-merge`: Vue
  hängt Aufrufer-Klassen per Attribut-Fallthrough an; Konflikte (Aufrufer
  setzt Farbe) verhindert die Governance-Regel statt einer Laufzeit-Merge-
  Bibliothek.
- **Pflicht-Label:** `M3IconButton` und `M3LinearProgress` deklarieren
  `label` als nicht-optionale Prop und setzen daraus `aria-label` → Typfehler
  ohne Label. Nicht `ariaLabel`: `vue-tsc` liest `aria-label="…"` an der
  Aufrufstelle als HTML-Attribut, eine Pflicht-Prop `ariaLabel` wäre in
  Kebab-Case nie erfüllbar (in der Umsetzung festgestellt).
- **Klickbare Karte:** `M3Card` mit `interactive` plus genau ein
  `M3CardLink` um den Titel. Dessen `::after` spannt sich über die ganze
  Karte (stretched link); Fokusring und State Layer sitzen auf der Karte.
  So bleibt ein einziger Tab-Stopp, der Link-Name ist nur der Titel, und
  Links im Inhalt (Blog-Auszüge) werden nicht mehr in einen Link
  verschachtelt – das war die Ursache der Hydration-Mismatches auf
  `/de/blog`. Solche Inhaltslinks und die `actions`-Zeile liegen mit
  `relative z-10` über dem Overlay und bleiben einzeln bedienbar.
- **NuxtLink auflösen:** `useInteractiveTag` bekommt die Link-Komponente
  von der aufrufenden SFC (`resolveComponent('NuxtLink')`). Nuxt registriert
  `NuxtLink` nicht global, sondern transformiert diesen Aufruf; der blanke
  String in `:is` rendert ein wirkungsloses `<nuxtlink>` (in der Umsetzung
  festgestellt).
- **Fortschrittsspur:** `M3LinearProgress` nutzt `surface-container-highest`
  als Spur statt `secondary-container`: Mit der gesättigten Sekundärfarbe
  käme der dunkle Container nur auf 1,87:1 gegen den `primary`-Balken.
- **Neutrales Label:** `M3Chip kind="label"` kennt neben den Rollen die Farbe
  `neutral` (gefülltes `surface-container-highest`). Ein farbloses Label ist
  transparent und hätte über einem Vorschaubild keinen gesicherten Kontrast
  (POI-Status „pausiert“).
- **Ablösung:** `Chip` → `M3Chip`, `NavigationIconButton` → `M3IconButton`;
  `CopyButton` bleibt als Komposition auf `M3IconButton`/`M3Button`,
  `SectionHeading`/`GradientText` bleiben und nutzen Typo-Tokens.

### D5a – Inhalte aus Markdown (in der Umsetzung ergänzt)
- **Links im Fließtext** sind immer unterstrichen: `primary` hält gegen
  `on-surface` keinen garantierten 3:1-Abstand (WCAG 1.4.1).
- **Code-Blöcke** liegen auf `surface-container-highest` und folgen dem
  Farbschema: `@nuxtjs/mdc` schaltet Shikis dunkles Theme nur unter einer
  `html.dark`-Klasse um, die die Seite nie setzt. Eine Regel in
  `tokens.css` unter `prefers-color-scheme: dark` übernimmt das.
- Die `prose`-Klassen der Seiten entfallen; das Typography-Plugin ist nicht
  installiert, die `Prose*`-Komponenten gestalten den Inhalt selbst.

### D6 – Governance als ein Test mit schrumpfender Ausnahmeliste
`tests/design-system/md3-governance.spec.ts` prüft die vier Regeln aus
`specs/design-system-governance` über `collectSourceFiles` (wie die
bestehenden Specs) für `layers/**` außer `layers/base/**`, `pages/**`,
`layouts/**`, `error.vue`. `components/OgImage/**` ist ausgenommen (Satori).
Eine Konstante `PENDING_MIGRATION: Record<string, Rule[]>` enthält beim Start
jede heute verletzende Datei mit den verletzten Regeln. Der Test scheitert,
wenn (a) eine nicht gelistete Datei verletzt, (b) eine gelistete Datei eine
gelistete Regel nicht mehr verletzt. Damit ist die Liste der Fortschrittsbalken
und kann nur schrumpfen.

Grenze (in der Umsetzung festgestellt): Die Button-Regel löst `:class`-
Bezeichner nur zu Konstanten derselben Datei auf. Kommen die Klassen aus
einer importierten Konstante, sieht sie sie nicht. Bewusste Fälle werden
deshalb trotzdem in `BUTTON_EXCEPTIONS` eingetragen – so der
Sprachwähler-Auslöser, der wie die Navigationseinträge aussieht
(`layers/navigation/utils/navItemClasses.ts`) und nicht wie ein
`M3Button`. Navigationseinträge sind keine Buttons: aktiver Indikator in
`secondary-container`, genau eine Textfarbe je Zustand
(`tests/design-system/navigation-classes.spec.ts`).

Die Regeln blenden HTML-, Block- und Zeilenkommentare vor dem Scannen aus:
Prosa wie „the rounded container“ ist keine Klassenliste (in der Umsetzung
als Fehlalarm aufgefallen). Pause-Schalter und Punkte des Karussells sind
eine weitere Ausnahme: Mini-Steuerelemente auf der Indikatorleiste über dem
Bild, für die MD3 keine Komponente hat.

Alternative: ESLint-Regel (z. B. `eslint-plugin-tailwindcss`). Verworfen: neue
Dependency, v4-Unterstützung unsicher, und die Quality-Ratchet blockiert nur
*steigende* Zahlen – ein Rückfall in einer Datei ließe sich durch eine
Korrektur in einer anderen verdecken.

### D7 – Kontrast und `theme-color` aus den Tokens geprüft
`contrast.spec.ts` bekommt eine Funktion, die `light-dark()`-Paare aus
`tailwind.css` liest; getestet werden alle Paare aus `specs/design-tokens`.
Ein weiterer Test liest die `theme-color`-Metas aus `app.vue` und vergleicht
mit `--color-surface`. `app.vue` bekommt die neuen Werte im Token-PR.

## Risks / Trade-offs

- [Opazitäts-Modifikator auf `light-dark()`-Token (`bg-primary/10`) –
  Tailwind erzeugt `color-mix(… var(--color-primary) 10%, transparent)`] →
  Der CI-Job `Colour roles across browsers` rendert Rolle, Tönung und State
  Layer in Chromium, Firefox und WebKit, hell und dunkel, und vergleicht
  Pixel (`scripts/cross-browser-colors.mjs`). Lokal lassen sich Firefox und
  WebKit nicht installieren; die Prüfung lebt deshalb in der CI.
- [Optik verschiebt sich sichtbar, v. a. Flächen und Grautöne] → Jeder PR mit
  Screenshots hell/dunkel vorher/nachher; Rückfragen zur Markenwirkung vor dem
  Merge des Token-PRs klären.
- [MD3-*Fidelity* liefert für `#EC008B` einen sehr gesättigten
  `tertiary-container`] → Kontrasttest erzwingt 4,5:1; falls optisch zu laut,
  Variante nur für die tertiäre Palette auf *Tonal Spot* stellen (reine
  Generator-Änderung, kein API-Bruch).
- [Viele parallele Migrations-PRs konfliktieren in `PENDING_MIGRATION`] →
  Liste alphabetisch, ein Eintrag pro Zeile; Domänen-PRs nacheinander mergen.
- [API von `@material/material-color-utilities` zwischen Versionen
  (`DynamicScheme`-Konstruktor)] → Version exakt pinnen; Generator-Test fängt
  jede Wertänderung beim Update ab. Gepinnt ist 0.3.0: 0.4.0 lässt sich in
  Node-ESM nicht laden (ein interner Import ohne `.js`-Endung), und 0.3.0
  erwartet `sourceColorArgb` statt `sourceColorHct`.
- [Lighthouse-A11y fällt durch veränderte Kontraste] → Kontrasttest vor dem
  Build; Lighthouse-Gate bleibt als zweite Linie.
- [State Layer via `background-image` überdeckt ein vorhandenes
  Hintergrundbild] → Primitives mit Bildern (Karte mit Medien) legen den
  State Layer auf den Container ohne Bild; dokumentiert im Skill.

## Migration Plan

Jede Stufe ist ein PR, CI grün, Screenshots hell/dunkel:

1. **Tokens & Leitplanken** – Generator, devDependency, MD3-Farbrollen,
   Typo/Shape/Elevation/Motion, `state-layer`/`focus-ring`/`touch-target`,
   umgebaute Farb-/Kontrasttests, `theme-color`, Governance-Test mit voller
   Ausnahmeliste. Keine Komponente ändert sich außer über `surface`.
2. **Interaktive Primitives** – `M3Button`, `M3IconButton`, `M3Chip` samt
   Typen, Composable, Komponententests; alle heutigen Nutzer von `Chip` und
   `NavigationIconButton` umgestellt, beide entfernt.
3. **Struktur-Primitives** – `M3Card`, `M3Divider`, `M3LinearProgress` mit
   ihren ersten Nutzern (`ArticleCard`, `ProseHr`, `CommunityPoiProgressBar`).
4. **Domänen-Migration**, je ein PR: navigation + footer, home, blog, team,
   community-poi, sponsoring + opencollective, content-core (Prose),
   pages + layouts + `error.vue`.
5. **Abschluss** – Alt-Tokens, `brand-scale.spec.ts` und
   `PENDING_MIGRATION` entfernen, `tokens.css` (Skip-Link) auf Rollen,
   Skill `tailwind-design` und `AGENTS.md` aktualisieren.

**Rollback:** Jede Stufe ist per `git revert` umkehrbar. Stufe 1 ohne
Stufe 2+ ist stabil (Alt-Tokens bleiben). Stufe 5 erst, wenn die Liste leer
ist.

## Open Questions

- Soll ein späterer Theme-Umschalter kommen? Die Rollen-Tokens sind darauf
  vorbereitet (`.dark { color-scheme: dark }` genügt dann), die Entscheidung
  ändert an diesem Change nichts.
