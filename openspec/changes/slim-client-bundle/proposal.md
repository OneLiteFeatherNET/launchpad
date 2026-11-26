# Proposal: Schlankere Auslieferung an den Browser

Ausgeliefert als `perf(deps)`.

## Why

Jede Seite liefert vor dem ersten Paint mehr Bytes aus, als sie braucht
(Production 1.42.0, `/en`, gemessen 2026-11-26):

- **HTML**: 250 KB roh, 43 KB Brotli. Davon 114 KB Inline-CSS
  (`features.inlineStyles: true`): 89 KB Tailwind samt Saison-Skins und
  Shiki-Variablen, 23 KB FontAwesome-CSS. Inline-CSS ist bei jedem Aufruf
  dabei und wird nicht separat gecacht.
- **Vorgeladenes JS**: 49 `modulepreload`-Links, zusammen rund 219 KB Brotli.
  Darunter der Entry-Chunk (136 KB roh, Budget 160 KB) und die
  FontAwesome-Laufzeit (`@fortawesome/fontawesome-svg-core` und
  `vue-fontawesome`, 99 KB roh) für rund 50 Icons in 11 Dateien. Die
  Laufzeit enthält Klassennamen für Icon-Familien, die die Site nicht nutzt
  (thin, light, duotone, sharp, slab, …).
- **posthog-js**: lädt nach der Hydration im Leerlauf als eigener Chunk
  (342 KB roh). Lighthouse meldet davon 66 KB als ungenutzt.

Auf langsamen Verbindungen konkurrieren diese Bytes mit HTML und LCP-Bild;
FCP liegt mobil auf allen Seiten bei rund 2,9 s.

## What Changes

- **Icons ohne Laufzeitbibliothek**: Eine eigene kleine Komponente rendert
  die Icon-Definitionen der `@fortawesome/free-*-svg-icons`-Pakete direkt als
  `<svg>` (Pfad und `viewBox` aus der Definition). `fontawesome-svg-core`,
  `vue-fontawesome`, das Plugin `plugins/fontawesome.ts` und
  `@fortawesome/fontawesome-svg-core/styles.css` entfallen. Darstellung,
  Größen und `aria-hidden` bleiben gleich; der Registry-Test wird auf die
  neue Komponente umgestellt.
- **Weniger Inline-CSS**: Tailwind scannt nur Quellen, die tatsächlich
  Klassen enthalten (`@source`-Bereiche prüfen); Saison-Skins und
  Shiki-Variablen nur dort, wo sie wirken, soweit das ohne sichtbare
  Änderung geht. `features.inlineStyles` bleibt an (bewusst behalten
  in PR #656, Gewinn auf Desktop).
- **posthog-js schlanker laden**: prüfen, ob posthog-js einen kleineren
  Einstieg bietet, der die genutzten Funktionen (Pageviews, Feature Flags,
  Capture, Opt-out) abdeckt, und ihn nutzen. Zeitpunkt des Ladens und
  Consent-Verhalten bleiben unverändert.
- **Abhängigkeiten aufräumen**: Laufzeit- und Build-Abhängigkeiten, die
  nichts mehr nutzt, entfernen; Pakete, die versehentlich im Client-Bundle
  landen, aufspüren (`nuxi analyze`).
- **Budgets**: Entry-Budget auf den neuen Stand plus 10 % senken; neue
  Budgets für die Summe des vorgeladenen JS und für die Inline-CSS-Größe.
- Nicht in diesem Change: Seiten- und Komponentenverhalten (LCP-Bilder,
  Hydration, Listener; das ist `improve-web-vitals`), Kürzen der
  `modulepreload`-Liste (verworfen), Cloudflare- und PostHog-Projekt-
  einstellungen.

## Capabilities

### New Capabilities
- `client-bundle`: Budgets und Regeln für das, was an den Browser geht.

## Impact

- `package.json`, `pnpm-lock.yaml`, `nuxt.config.ts` (`css`, `vite`,
  Module), `plugins/fontawesome.ts` (entfällt), die 11 Dateien mit Icons,
  `assets/css/tailwind.css`, `assets/css/seasons.css`,
  `layers/base/plugins/posthog.client.ts`.
- Tests: `tests/performance/`, `tests/architecture/fontawesome-registry.spec.ts`.
