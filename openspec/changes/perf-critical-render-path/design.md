# Design: Kritisches CSS inlinen und das Entry-Bundle verschlanken

## Context

Motivation und Messwerte: siehe `proposal.md`. Gelesen an `origin/main`
`83fc3fe`.

Befunde im Code:

- `nuxt.config.ts`: `css: ['@fortawesome/fontawesome-svg-core/styles.css',
  '~/assets/css/tailwind.css']`; Tailwind v4 läuft über `@tailwindcss/vite`.
  Es gibt keine Einträge für `features.inlineStyles`, `experimental.*`,
  `build.modulePreload` oder `vitalizer`; `nuxt-vitalizer` ist als Modul
  geladen, aber unkonfiguriert.
- `assets/css/tailwind.css` (13 KB) importiert `tailwindcss` und
  `seasons.css` (12 KB, nur unter `<html data-season>` wirksam, also meist
  totes CSS); `app.vue` importiert außerdem `tokens.css` in einem globalen
  `<style>`. Alles landet im einen `entry.*.css`.
- `plugins/fontawesome.ts` registriert ~50 Icons global in der Bibliothek und
  `FontAwesomeIcon` global; die Registrierung läuft im Entry und ist nicht
  tree-shakebar, solange per String-Syntax referenziert wird
  (`tests/architecture/fontawesome-registry.spec.ts` hält Registry und
  Verwendung zusammen).
- Seiten sind bereits teilweise lazy (`pages/index.vue`: `LazyDiscordCta
  hydrate-on-visible` usw.; `tests/architecture/lazy-components.spec.ts`
  verbietet handgebautes `defineAsyncComponent` in Seiten).
- Client-Plugins: `layers/base/plugins/posthog-*.client.ts`,
  `layers/consent/plugins/cookie-consent.client.ts`,
  `layers/season/plugins/season-preview.client.ts`, dazu die Module
  `nuxt-posthog`, `@nuxt/content` (Client-Teile), `@nuxtjs/i18n`
  (Locale-Meldungen), `nuxt-link-checker`, `nuxt-og-image`. Welcher Anteil der
  168 KB davon stammt, ist noch nicht gemessen (Aufgabe 1.2).
- HTML wird am Edge gecacht (`cloudflare-cdn-cache-control`, komprimiert).
  Eingebettetes CSS wächst in jede HTML-Antwort, wird aber nur einmal pro
  Cache-Eintrag erzeugt und ist gut komprimierbar.

## Goals / Non-Goals

**Goals:** kein blockierender Stylesheet-Request für die erste Ansicht;
spürbar weniger Entry-JS und weniger modulepreload-Links; messbar bessere
Mobile-Werte (FCP, LCP, TBT) ohne Desktop-Regression.

**Non-Goals:** Bilder (LCP-Bild, Formate, `fetchpriority`) und Schriften,
Serverlaufzeit/TTFB, Caching-Regeln, Redesign. Die LCP-Bild-Arbeit deckt
der eigene Change `perf-home-lcp-image` (#631) ab. Mobile Lighthouse in
`seo.yml` ist kein Teil dieses Changes (möglicher Folge-Change).

## Decisions

1. **Erst ein Spike, dann die Wahl.** Was Nuxt 4 inlined, ist nicht aus der
   Dokumentation allein sicher: `features.inlineStyles` (Standard
   `(id) => id.includes('.vue')`) betrifft Komponenten-`<style>`; ob die
   gebündelte Datei aus `css:`-Einträgen (hier Tailwind) mit eingebettet wird,
   zeigt nur ein Build. Der Spike baut mit jeder Variante und zählt im HTML
   von `/en` die `<link rel="stylesheet">` und die Größe des `<style>`.
   Varianten:
   - **A) Nuxts eingebautes `features.inlineStyles` anpassen** (Funktion,
     die auch das Entry-CSS erfasst), gegebenenfalls ergänzt durch eigene
     Build-Hooks (`build:manifest`, `vite:extendConfig`), die den
     Entry-Stylesheet-Link aus dem Render nehmen. Das ist der erste Versuch.
     Geringster Eigenbau; Risiko: gesamte 114 KB landen in jedem HTML.
   - **A′) `nuxt-vitalizer` (`disableStylesheets: 'entry'`) nur als
     Rückfall.** Das Modul ist geladen, aber unkonfiguriert. Es wird erst
     konfiguriert, wenn die Messung zeigt, dass der eingebaute Weg (A) das
     Entry-CSS nicht vom blockierenden Pfad nehmen kann; diese Messung steht
     dann in der PR-Beschreibung als Begründung (AGENTS.md: keine neuen
     Abhängigkeiten oder Presets ohne klare Begründung). Wird eine neue
     Abhängigkeit nötig, gilt dieselbe Regel.
   - **B) Kritisches CSS getrennt halten**: Tokens/Reset/Layout der ersten
     Ansicht inline (kleiner Eigen-Eintrag), Rest per `preload as=style`
     bzw. `media`-Trick nachladen. Kleinstes HTML, aber Pflegeaufwand und
     FOUC-Risiko, weil Tailwind-Utilities keine Grenze „kritisch“ kennen.
   - **C) Ungenutztes CSS zuerst kleiner machen** (siehe 2.) und dann A.

   Empfehlung: **C dann A**, B nur wenn A das HTML über das Budget
   aufbläst. **Budget (vom Maintainer festgelegt): HTML-Zuwachs bis etwa
   25 KB komprimiert pro Seite.** A′ nur nach Messung, siehe oben; die
   Vitalizer-Optionen sind aus dem Gedächtnis benannt und werden dann gegen
   die installierte Version geprüft.
2. **CSS verkleinern.** (a) `seasons.css` nur laden, wenn eine Saison aktiv
   ist: heute immer im Entry; die Saison wird auf dem Server entschieden
   (`layers/season`). Cache-Regel beachten: kein Lesen von `route.query`
   (`request-independent-render.spec.ts`), die `?season=`-Vorschau bleibt
   Client-Sache. (b) Tailwind-`@source`/Scan prüfen: nichts Überflüssiges
   (z. B. `content/`, `docs/`, `tests/`) scannen lassen. (c) FontAwesome-
   `styles.css` auf die wirklich genutzten Regeln prüfen. (d) Prose/Code-
   Highlighting-Stile (`@nuxt/content`) nur für Content-Seiten. Jeder
   Schritt wird einzeln gemessen; Abbruch, wenn er unter ~3 KB gewinnt.
3. **modulepreload gezielt kürzen.** `vite.build.modulePreload` steuert den
   Vite-Client-Polyfill; die Links im HTML erzeugt Nuxts Renderer aus dem
   Build-Manifest. Der Ansatz ist der Hook `build:manifest`, der bei Chunks
   außerhalb der ersten Ansicht `preload`/`prefetch` ausschaltet. Welche
   Chunks, zeigt die Messung (Aufgabe 1.2). Risiko: zu wenig Preload
   verlängert Wasserfälle bei der Hydration; verglichen wird deshalb mit
   Lighthouse (TBT, LCP), nicht nur mit der Linkzahl.
4. **Entry-JS verkleinern.** Reihenfolge nach Messung (`nuxi analyze`):
   (a) Plugins, die nicht für den ersten Paint nötig sind, auf Idle
   verschieben, wie es `posthog-recording.client.ts` schon tut;
   (b) FontAwesome: die globale Registry ist nur durch Umstellung auf
   direkte Icon-Importe zu entfernen; das ist groß und nicht Teil dieses
   Changes, außer die Messung zeigt mehr als 10 KB Gewinn;
   (c) `build.rollupOptions.output.manualChunks` nur, wenn ein großer, nicht
   sofort genutzter Block sauber abtrennbar ist; kein pauschales Vendor-
   Chunking, das mehr Preload-Links erzeugt; (d) weitere `Lazy…`-Komponenten
   mit `hydrate-on-visible`/`-on-idle` nach den bestehenden Regeln.
5. **Architekturregeln bleiben.** Ein neuer Wertexport in einer Layer-
   `index.ts` kann den Client-Build brechen (Rollup/`impound`, siehe
   AGENTS.md); jede Verschiebung zwischen Layern oder neue Barrel-Exporte
   wird mit `pnpm build` geprüft, nicht nur mit Tests. `tests/architecture/`
   wird nicht gelockert.
6. **Typ `perf(build)`**: Es ändert sich, wie schnell dieselbe Seite
   erscheint, nicht was sie zeigt. Alle Commits tragen diesen Typ; ein
   dabei entdeckter Fehler (z. B. Hydration) ist ein eigener `fix`.

## Risks / Trade-offs

- **HTML wächst** um das eingebettete CSS; Edge-Cache und Kompression
  dämpfen das, Cache-Volumen und Übertragungsgröße steigen leicht. Das
  Budget im Spike deckelt es.
- **FOUC/Layout-Sprünge**, wenn nachgeladenes CSS Regeln der ersten Ansicht
  enthält. Gegenmittel: Screenshot-Vergleich vor/nach.
- **Hydration-Mismatches** durch neue Lazy-/Idle-Grenzen; Konsolenprüfung im
  Produktions-Build.
- **Messrauschen**: Lighthouse Mobile schwankt um mehrere Punkte; je
  Variante mindestens 5 Läufe, Median berichten.
- **SEO**: Crawler müssen weiterhin vollständig gerenderte Seiten sehen;
  `/_nuxt/` bleibt in `robots.txt` erlaubt.

## Budget-Tests

Fest eingeplant (Maintainer-Entscheidung): ein Test für die
`modulepreload`-Obergrenze und einer für „kein blockierendes
Entry-Stylesheet“. Nach F.I.R.S.T. sind sie schnell und wiederholbar, weil
sie keinen Server brauchen: Die Hook-Logik (welche Chunks Preload behalten,
welche CSS-Einträge inlined werden) liegt in einer reinen, importierbaren
Funktion und wird mit einem handgebauten Manifest geprüft. Ein zusätzlicher
Test darf die Build-Ausgabe (`.output`) lesen, aber nur, wenn der Build ein
eigener, ausdrücklicher Schritt ist (CI `pnpm build` läuft ohnehin davor);
ohne Build-Ausgabe wird er übersprungen und nie implizit gebaut.
