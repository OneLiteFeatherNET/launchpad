# Proposal: Seitenwechsel ansagen, Karussell-Rahmen benennen

Ausgeliefert als `fix(a11y)`. Pull-Request-Titel:
`fix(a11y): announce page changes and label the carousel`

## Why

1. **Stille Navigation.** `app.vue` rendert keinen `<NuxtRouteAnnouncer />`.
   Bei einem clientseitigen Seitenwechsel ändert sich der Titel, aber ein
   Screenreader sagt nichts; Nutzer merken nicht, dass die Seite gewechselt hat
   (WCAG 4.1.3 Statusmeldungen).
2. **Unbenannter Tab-Stopp im Karussell.** Der Slide-Rahmen in
   `layers/home/components/Carousel.vue` trägt `tabindex="0"`, aber weder Rolle
   noch Namen: Der Fokus landet auf einem namenlosen Element. Die
   Pfeiltasten-Steuerung hängt am umschließenden `<section>` und funktioniert
   ohnehin von jedem fokussierbaren Kind aus (Vor/Zurück, Punkte, Pause); der
   Rahmen selbst hat keine Tastaturfunktion.

## What Changes

- `<NuxtRouteAnnouncer />` in `app.vue`. Er liest `document.title`, das über
  `useHead`/`usePageSeo` samt Titel-Template entsteht; ein Seitenwechsel sagt
  also den Seitentitel an. Der Announcer ist eine unsichtbare Live-Region und
  verschiebt weder Fokus noch berührt er den Skip-Link.
- Karussell: den namenlosen Tab-Stopp (`tabindex="0"`) am Rahmen entfernen;
  `<section>` bekommt explizit `role="region"` (Name und
  `aria-roledescription="carousel"` sind vorhanden, Slides sind bereits
  `role="group"` mit „Slide n of m“-Label aus i18n). Keine neuen Strings:
  `carousel.label` und `carousel.slide_position` existieren in en und de.
- Zeilen zu Preload/`NuxtPicture` bleiben unberührt (parallel
  `perf/home-lcp-image`).

## Capabilities

### New Capabilities

- `route-announcements`: Seitenwechsel werden Hilfstechnologien angesagt.

### Modified Capabilities

- `home-carousel-highlights`: Karussell-Semantik nach WAI-ARIA APG.

## Impact

- `app.vue`, `layers/home/components/Carousel.vue`
- `tests/a11y/` (neue Tests)
- Keine neuen Abhängigkeiten, keine neuen i18n-Schlüssel.
