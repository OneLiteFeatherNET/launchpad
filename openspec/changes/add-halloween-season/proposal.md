# Proposal: Halloween-Skin für die ganze Website

## Why

Die Community soll zu Halloween eine sichtbar verkleidete Website sehen – ein
saisonaler Skin über alle Seiten statt einer eigenen Themenseite. Das Fenster
beginnt am 20. Oktober. Die MD3-Migration (`adopt-md3-design-system`) ist
auf `main` abgeschlossen: Jede Komponente liest Farbrollen, die Alt-Tokens
sind entfernt. Ein Skin muss also nur die Rollen neu belegen – plus die
wenigen festen Markenfarben außerhalb der Rollen (Verläufe, Glow).

Ein früherer Versuch (`feat/seasonal-theming`, nicht gemerged) ist nicht mehr
übernehmbar: Er stammt aus der Zeit vor den Domänen-Layern, ändert 102 Dateien
und überschreibt ~30 Alt-Tokens von Hand – genau die Tokens, die die
MD3-Migration am Ende löscht, und mit der dort selbst benannten Schwäche, dass
jeder vergessene Token mitten im Kürbis-Orange blau bleibt. Seine
Laufzeit-Logik (Kalenderfenster in Berliner Zeit, Server-Entscheidung per
`useState`, `?season=`-Vorschau, Notschalter per Umgebungsvariable) ist dagegen
gut und wird neu aufgesetzt.

## What Changes

- **Saison-Mechanik.** Eine reine Funktion entscheidet aus Datum (Zeitzone
  `Europe/Berlin`) und `NUXT_PUBLIC_SEASON`, ob eine Saison aktiv ist. Die
  Entscheidung fällt einmal auf dem Server und wird hydratisiert; `app.vue`
  setzt daraus `data-season` auf `<html>`. `NUXT_PUBLIC_SEASON=none` schaltet
  jede Saison ab. Eine `?season=`-Vorschau wirkt nur im Browser nach dem
  Laden, weil das HTML an der Edge gecacht wird.
- **Saison-Farben aus dem MD3-Generator.** `scripts/md3-tokens.mjs` erzeugt
  pro Saison aus wenigen Seed-Farben den vollständigen Satz MD3-Rollen und
  schreibt ihn als `html[data-season="…"]`-Block in einen eigenen markierten
  Bereich von `assets/css/tailwind.css`. Vollständigkeit und Kontrast sind
  damit strukturell gesichert und von denselben Tests geprüft wie das
  Basis-Schema.
- **Deko-Farben außerhalb der Rollen.** Derselbe Saison-Block belegt die
  festen Markenfarben neu, die keine Rolle sind: die vier `--gradient-*`
  (Wortmarke, `GradientText`) und die Glow-Rohfarben `--brand-magenta` /
  `--brand-cyan` (Verbindungsbox auf der Startseite).
- **Halloween-Identität.** Neu gestaltetes Halloween-Logo und -Favicon (aus dem
  bestehenden Logo abgeleitet), `theme-color` passend zur Saison-Surface.
- **Dezente Deko.** Eine rein dekorative, `aria-hidden` Ebene (Spinnennetze in
  den oberen Ecken, einzelne Fledermäuse ab `md`), die nicht klickbar ist,
  nicht über der Navigation liegt und bei `prefers-reduced-motion` stillsteht
  bzw. entfällt.
- **Ergänzung am MD3-Design.** Das Non-Goal „keine Laufzeit-Themes“ in
  `adopt-md3-design-system/design.md` wird präzisiert: kalendergesteuerte
  Saisons aus demselben Generator sind erlaubt, Nutzer-Theme-Wahl weiterhin
  nicht.

Nicht Teil dieses Changes: saisonale Inhalte (Hero-Text, Carousel-Slide,
Blogpost) – das ist Redaktionsarbeit; OG-Bilder bleiben unverändert.

## Capabilities

### New Capabilities
- `seasonal-theming`: Wann eine Saison aktiv ist, wie sie vorab angesehen und
  abgeschaltet wird, und dass eine Saison die gesamte Farbgebung vollständig
  und kontrastsicher ersetzt – inklusive Browser-Chrome.
- `halloween-season`: Die konkrete Halloween-Saison: Zeitfenster, Farbwirkung,
  Logo/Favicon und dekorative Ebene mit ihren Barrierefreiheits- und
  Performance-Grenzen.

### Modified Capabilities
<!-- Keine: openspec/specs/ enthält noch keine archivierten Specs. Die
     MD3-Specs liegen im laufenden Change adopt-md3-design-system; dessen
     design.md wird als Task angepasst, seine Requirements bleiben gültig. -->

## Impact

- **Neuer Layer** `layers/season/` (Composable `useSeason`, Komponente
  `SeasonDecor`, Typen) und `shared/utils/season.ts` (reine Auflösungslogik,
  top-level nach der `shared/`-Regel). Registrierung in den Architekturtests.
- **Geändert:** `scripts/md3-tokens.mjs` (Saison-Schemata + Deko-Farben),
  `assets/css/tailwind.css` (neuer generierter Block, `@custom-variant`),
  `app.vue` (`data-season`, dynamisches `theme-color`/Favicon, Deko),
  `layers/navigation/components/NavigationBar.vue` (Logo je Saison),
  `nuxt.config.ts` (`runtimeConfig.public.season`).
- **Tests:** `md3-tokens.spec.ts` (Saison-Block aktuell, theme-color-Prüfung
  auf den neuen Mechanismus), `contrast.spec.ts` (Rollenpaare auch für jede
  Saison), neue Tests für die Auflösungslogik und die Deko.
- **Neue Assets:** `public/images/seasons/halloween/logo.svg`,
  `public/images/seasons/halloween/favicon.svg`.
- **Keine neue Dependency.** `@material/material-color-utilities` ist bereits
  devDependency.
- **Caching:** HTML wird eine Stunde an der Edge gecacht (danach
  stale-while-revalidate, `edge-caching-and-seo`); der Saisonwechsel und der
  Notschalter greifen daher mit rund einer Stunde Verzögerung. Das HTML hängt nicht von `?season=` ab (Vorschau nur im Client).
- **Grundlage:** setzt auf dem abgeschlossenen MD3-Stand von `main` auf
  (Generator, Rollen, keine Alt-Tokens).
