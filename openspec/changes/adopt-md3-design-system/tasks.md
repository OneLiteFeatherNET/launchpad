# Tasks

Jede Gruppe 1–12 entspricht einem eigenen Pull Request (design.md –
Migration Plan). Vor jedem PR gilt: `pnpm test`, `pnpm build` und
`pnpm quality` grün, Screenshots hell/dunkel vorher/nachher im PR.

## 1. Token-Generator (PR 1)

- [x] 1.1 `@material/material-color-utilities` als exakt gepinnte devDependency hinzufügen und per Context7 den aktuellen `DynamicScheme`-/`customColor`-API-Stand prüfen; verifiziert durch `pnpm install --frozen-lockfile` nach Lockfile-Update
- [x] 1.2 `scripts/md3-tokens.mjs` schreiben: Kernfarben `#2A388F`/`#27A9E1`/`#EC008B`, Variante Fidelity, Kontraststufe 0, Custom Colors Orange/Violett ohne Blend, Ausgabe als `light-dark()` zwischen den Markern `md3:generated:start/end`; Modus `--check` mit Exit-Code ≠ 0 bei Abweichung; verifiziert durch zweimaligen Lauf ohne Diff
- [x] 1.3 Marker und erzeugte Farbrollen in den `@theme`-Block von `assets/css/tailwind.css` einfügen, Alt-Tokens unverändert lassen; verifiziert durch `pnpm build` und eine Stichprobe `bg-surface-container-high` im erzeugten CSS
- [x] 1.4 `tests/design-system/md3-tokens.spec.ts`: Generator-Aktualität (Handänderung an `primary` lässt ihn mit Token-Namen scheitern) und Vollständigkeit aller Rollen aus `specs/design-tokens`; verifiziert durch einen absichtlich rot gemachten Lauf und zurück

## 2. Nicht-Farb-Tokens und Utilities (PR 1)

- [x] 2.1 MD3-Typeskala als `--text-*` mit `--line-height`/`--font-weight`/`--letter-spacing` in `@theme` ergänzen; verifiziert durch Test, dass `text-title-medium` alle vier Eigenschaften im Build-CSS setzt
- [x] 2.2 Shape-Tokens `--radius-extra-small` … `--radius-extra-large`, `--shadow-elevation-1…5` und `--ease-standard`/`--ease-emphasized` (+ accelerate/decelerate) ergänzen; verifiziert durch Test, dass `rounded-md`/`rounded-lg` weiterhin Tailwinds Standardwerte haben und `rounded-medium` 12 px ist
- [x] 2.3 `@utility state-layer`, `@utility focus-ring` und `@utility touch-target` gemäß design.md D4 anlegen; verifiziert durch Komponententest an einem Testelement (Hover-Opazität 8 %, disabled 0 %) und `utility-classes.spec.ts` grün
- [ ] 2.4 Opazitäts-Modifikator auf Rollen-Tokens (`bg-primary/10`) in Chromium, Firefox und WebKit per Playwright gegen `pnpm preview` prüfen; Ergebnis im PR dokumentieren

## 3. Umgebaute Farb- und Kontrasttests, theme-color (PR 1)

- [x] 3.1 `dead-color-tokens.spec.ts` umbauen: Verbote für `--color-secondary` und bare `primary`/`secondary`-Klassen durch „jede Farbklasse zeigt auf einen definierten Token“ ersetzen; verifiziert durch einen Test-Fall mit `bg-surface-contaner`, der scheitert
- [x] 3.2 `contrast.spec.ts` um das Auslesen von `light-dark()`-Paaren erweitern und alle Rollenpaare, `on-surface`/`on-surface-variant` je Surface-Stufe (≥ 4,5:1), `outline` und Fokusfarbe `secondary` (≥ 3:1) in beiden Schemata prüfen; verifiziert durch grünen Lauf und Fehlermeldung mit Paar/Schema/Wert bei künstlich schlechtem Wert
- [x] 3.3 `theme-color`-Metas in `app.vue` auf die hellen/dunklen `surface`-Werte setzen und Test ergänzen, der beide mit `--color-surface` vergleicht

## 4. Governance-Test (PR 1)

- [x] 4.1 `tests/design-system/md3-governance.spec.ts` mit den Regeln Rohfarben, farbige `dark:`-Varianten, Nicht-MD3-Radius/-Schatten und gestylte rohe `<button>` für `layers/**` (ohne `base`), `pages/**`, `layouts/**`, `error.vue` schreiben; `components/OgImage/**` ausnehmen; Fehlermeldungen mit Datei, Zeile, Klasse und Ersatzvorschlag
- [x] 4.2 `PENDING_MIGRATION` mit allen heute verletzenden Dateien und ihren Regeln befüllen (alphabetisch, ein Eintrag pro Zeile) und Prüfungen „nicht gelistete Datei verletzt“ und „gelistete Regel nicht mehr verletzt“ ergänzen; verifiziert durch grünen Lauf sowie je einen roten Lauf für beide Fälle
- [x] 4.3 Registrierte Ausnahmen für rohe `<button>` mit Begründung unterstützen und in der Testausgabe listen; verifiziert durch einen Beispielfall im Test

## 5. Interaktive Primitives (PR 2)

- [x] 5.1 `layers/base/types.ts` mit `ButtonVariant`, `IconButtonVariant`, `CardVariant`, `ChipKind`, `M3Color` anlegen und Typ-Exporte in `layers/base/index.ts` aufnehmen; verifiziert durch `pnpm typecheck` ohne neue Fehler
- [x] 5.2 `layers/base/composables/useInteractiveTag.ts` aus der Tag-Logik von `Chip.vue` extrahieren (NuxtLink/a/button, `type="button"`, `rel="noopener noreferrer"` bei `target="_blank"`); verifiziert durch Unit-Test aller drei Fälle
- [x] 5.3 Varianten-Klassen-Maps in `layers/base/utils/` mit vollständigen Klassen-Strings anlegen; verifiziert durch Test, dass jede Variante nur Rollen-, Shape-, Elevation- und Typo-Tokens nennt
- [x] 5.4 `M3Button` (filled/tonal/outlined/text/elevated, Icon-Slot, disabled, Link-Modus, 40 px Höhe, Touch Target) bauen; verifiziert durch Komponententests zu Standardvariante, externem Link, disabled und Tastaturauslösung
- [x] 5.5 `M3IconButton` (standard/filled/tonal/outlined, Pflicht-`label` (siehe design.md D5), Toggle mit `aria-pressed`, Größen) bauen; verifiziert durch Komponententest und einen `vue-tsc`-Fall ohne Label, der scheitert
- [x] 5.6 `M3Chip` (assist/filter/suggestion + nicht interaktive Kennzeichnung, Häkchen bei Auswahl, `color`-Prop) bauen; verifiziert durch Komponententests zu Filter-Auswahl und Status-Kennzeichnung ohne Button-Rolle
- [x] 5.7 Alle Nutzer von `Chip` und `NavigationIconButton` (u. a. `ArticleCard`, `Top1`, `TeamMemberCard`, `NavigationBar`, `ServerAddressCard`, `Carousel`, `pages/team/[slug].vue`, `pages/blog/[...slug].vue`) umstellen, `CopyButton` auf `M3IconButton` aufbauen, `Chip.vue` und `NavigationIconButton.vue` löschen; verifiziert durch `unused-components.spec.ts`, `layer-name-collisions.spec.ts`, die a11y-Tests (`carousel-*`, `mobile-menu-focus`) und Screenshots

## 6. Struktur-Primitives (PR 3)

- [x] 6.1 `M3Card` (elevated/filled/outlined, Medien-/Inhalt-/Aktionsbereich, stretched link, State Layer ohne Bildüberdeckung) bauen und `ArticleCard` darauf umstellen; verifiziert durch Komponententest „ein Tab-Stopp, eigene Aktion separat erreichbar“ und `article-card-image.spec.ts` grün
- [x] 6.2 `M3Divider` bauen und `ProseHr` darauf umstellen; verifiziert durch Komponententest (Rolle `separator`, dekorativ ohne Rolle)
- [x] 6.3 `M3LinearProgress` bauen und `CommunityPoiProgressBar` darauf umstellen; verifiziert durch Komponententest zu `role`/`aria-valuenow`/Pflicht-Label
- [x] 6.4 `SectionHeading` auf Typo-Tokens pro `level` und Rollenfarben umstellen; verifiziert durch `heading-structure.spec.ts` und Screenshots
- [x] 6.5 Migrierte Dateien aus `PENDING_MIGRATION` entfernen; verifiziert durch grünen Governance-Test

## 7. Migration navigation + footer (PR 4)

- [x] 7.1 `NavigationBar`, `NavigationItem`, `LanguageSelector`, `SiteFooter` auf Rollen-Tokens, `focus-ring`, Shape/Elevation und Primitives umstellen, alle `dark:`-Farben entfernen; verifiziert durch Governance-Test ohne diese Dateien in der Liste, `nav-active-state.spec.ts`, `mobile-menu-focus.spec.ts`, `landmarks.spec.ts` und Screenshots

## 8. Migration home (PR 5)

- [x] 8.1 `Carousel` und alle `CarouselItem*`, `FaqSection`, `ServerAddresses`, `ServerAddressCard`, `ServerConcept` auf Tokens und Primitives (`M3Card`, `M3IconButton`, `M3Button`) umstellen; verifiziert durch Governance-Test, `carousel-live-region.spec.ts`, `carousel-pause.spec.ts` und Screenshots der Startseite

## 9. Migration blog, team (PR 6, PR 7)

- [x] 9.1 `Top1`, `FeaturedTeamMembers`, `SocialMediaShare` sowie `pages/blog/**` umstellen; verifiziert durch Governance-Test und Screenshots Blog-Übersicht/-Artikel
- [ ] 9.2 `TeamMemberCard`, `OpenPositionCard` (Bewerben-Link → `M3Button`), `TeamRankSection`, `TeamFaqSection` sowie `pages/team/**` umstellen; verifiziert durch Governance-Test und Screenshots Team-Übersicht/-Profil

## 10. Migration community-poi (PR 8)

- [ ] 10.1 `CommunityPoiCard`, `CommunityPoiGrid`, `CommunityPoiGallery` (Buttons → `M3IconButton`), `CommunityPoiCoordsCopy` umstellen; verifiziert durch Governance-Test, `poi-card-image-*.spec.ts` und Screenshots
- [ ] 10.2 `CommunityPoiStatusBadge` und `CommunityPoiCategoryBadge` als `M3Chip`-Kennzeichnung mit Rollen-/Custom-Color-Zuordnung umsetzen; verifiziert durch Komponententest (keine Button-Rolle) und Kontrast der gewählten Farbpaare
- [ ] 10.3 Übrige POI-Komponenten (`Collaboration`, `ContributeInfo`, `GoalState`, `LitematicaHelp`, `Lore`, `Meta`, `SchematicList`, `Bluemap`) sowie `pages/community-poi/**` und `pages/bluemap.vue` umstellen; verifiziert durch Governance-Test und Screenshots

## 11. Migration sponsoring, opencollective, content-core, Rest (PR 9, PR 10)

- [ ] 11.1 `Sponsoring` (rohe Buttons → Primitives) und `OpenCollectiveStats` umstellen; verifiziert durch Governance-Test und Screenshots
- [ ] 11.2 Alle `Prose*`-Komponenten in `content-core` auf Typo- und Rollen-Tokens umstellen; verifiziert durch Governance-Test und Screenshot eines Blogartikels mit Überschriften, Listen, Code und Bild
- [ ] 11.3 `pages/index.vue`, `pages/imprint.vue`, `pages/privacy.vue`, `layouts/default.vue` und `error.vue` umstellen; verifiziert durch Governance-Test mit leerer `PENDING_MIGRATION` und Screenshots inkl. 404-Seite

## 12. Abschluss (PR 11)

- [ ] 12.1 Alt-Tokens (`bg`, `text`, `muted`, `border`, `brand-50…900`, `secondary-*`, sowie nicht mehr genutzte `brand-*`-Einzelfarben) aus `@theme` entfernen, Verlaufs-Tokens behalten; `tokens.css` (Skip-Link) auf Rollen-Tokens umstellen; verifiziert durch `dead-color-tokens.spec.ts` grün und einen Test, dass `text-muted` nicht mehr auflöst
- [ ] 12.2 `brand-scale.spec.ts` und `PENDING_MIGRATION` samt zugehöriger Prüfungen entfernen; verifiziert durch `pnpm test` grün
- [ ] 12.3 `.claude/skills/tailwind-design/SKILL.md` auf den neuen Token-Vertrag (Rollen, Skalen, Utilities, Primitives, Governance) umschreiben und `AGENTS.md` um einen Abschnitt „UI-Primitives“ ergänzen; verifiziert durch Review, dass keine Aussage des Skills mehr dem Code widerspricht
- [ ] 12.4 Gesamtprüfung: `pnpm build`, `pnpm test`, `pnpm quality` (kein gestiegener Wert, ggf. `pnpm quality:update` bei gesunkenem) und Lighthouse-Accessibility ≥ 0,9 auf Start-, Blog-, Team- und POI-Seite; Ergebnis im PR dokumentieren
