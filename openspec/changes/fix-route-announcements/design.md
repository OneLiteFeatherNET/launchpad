# Design: Seitenwechsel ansagen, Karussell-Rahmen benennen

## Context

Motivation: siehe `proposal.md`.

- `app.vue` setzt den Titel über `useHead({ titleTemplate })`; Seiten liefern
  den Titelteil über `usePageSeo`. `NuxtRouteAnnouncer` liest nach jeder
  Navigation `document.title` und schreibt ihn in eine `aria-live`-Region.
- Der Skip-Link (`layouts/default.vue`) zeigt auf `#main-content` und bleibt
  unberührt; der Announcer bewegt keinen Fokus.
- `Carousel.vue`: `<section aria-label aria-roledescription="carousel"
  @keydown>`; darin der Rahmen mit `tabindex="0"`. `keydown` blubbert von
  jedem Kind, die Prev/Next-Buttons werden bei Fokus sichtbar (`group-focus-within`).

## Decisions

1. **Announcer in `app.vue`**, außerhalb von `NuxtLayout`, damit er für jedes
   Layout und auch `error.vue`-Navigationen gilt.
2. **Tab-Stopp entfernen statt benennen.** Ein Name auf einem Element ohne
   eigene Funktion würde nur einen weiteren, redundanten Stopp ankündigen.
   Tastaturparität bleibt über Buttons und Pfeiltasten im `<section>` erhalten.
3. **`role="region"` explizit**, obwohl `<section>` mit Namen implizit eine
   Region ist: macht die APG-Struktur im Quelltext und im Test sichtbar.
4. Typ `fix(a11y)`: beides korrigiert fehlende Zugänglichkeit, kein Feature.
