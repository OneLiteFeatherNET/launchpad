# Proposal: Das LCP-Bild der Startseite genau einmal und passend vorladen

Ausgeliefert als `perf(home)`. Pull-Request-Titel:
`perf(home): preload exactly the carousel image the browser renders`

## Why

Das größte Element auf `/en` ist das Bild der ersten Carousel-Folie. Lighthouse
(mobile) meldet dazu "fetchpriority=high should be applied" als nicht erfüllt,
und die Ladereihenfolge ist unsauber:

1. **Zwei `<link rel="preload" as="image">` für dasselbe Bild.** Einen setzt
   `layers/home/components/Carousel.vue` von Hand (`useHead`, mit
   `fetchpriority="high"`), den zweiten erzeugt `NuxtPicture` in jeder
   `CarouselItem*.vue` über `:preload="priority"` — ohne `fetchpriority`, weil
   `preload` dort ein bloßes `true` ist. Beide haben eigene `imagesrcset`-Listen
   (hand: 640w/1280w; `NuxtPicture`: aus `sizes` und `densities`). Der Browser
   kann also zwei verschiedene Kandidaten laden, und der unmarkierte konkurriert
   mit dem markierten.
2. **Die Größenangaben driften.** Der Preload nennt `imagesizes` mit
   Umbruchpunkten 768/1024, das `<source sizes>` aus
   `sizes="sm:100vw md:100vw lg:1280px"` in `CarouselItemBlog.vue` (und den
   fünf Geschwistern) trägt 767/1023. Zwischen den Werten wählt der Browser für
   den Preload und fürs gerenderte `<img>` unterschiedliche Kandidaten; das
   vorgeladene Bild wird dann verworfen und ein zweites geladen.

## What Changes

- Eine gemeinsame Größenangabe als Domain-Util in der Home-Schicht
  (`layers/home/utils/carouselImage.ts`), aus der sowohl das `sizes` der
  `NuxtPicture` als auch das `imagesizes` des Preloads entstehen.
- Genau ein Preload pro Seite, mit `fetchpriority="high"`: der von
  `NuxtPicture` erzeugte (er speist sich aus denselben Daten wie das
  gerenderte `<source>`), mit `:preload="{ fetchPriority: 'high' }"` für die
  Folie mit `priority`. Der handgebaute Preload in `Carousel.vue` entfällt.
- Das Logo in `CarouselItemProject.vue` verliert sein `:preload`, damit eine
  Projekt-Folie nicht zwei Bilder gleich hoch vorlädt.
- Tests halten fest, dass `sizes` und `imagesizes` aus einem Wert kommen und
  die Seite genau einen Bild-Preload mit hoher Priorität hat.

## Capabilities

### New Capabilities

- `home-carousel`: das Bild der ersten Folie wird einmal, passend zum
  gerenderten Kandidaten und mit hoher Priorität vorgeladen.

### Modified Capabilities

Keine.

## Impact

- `layers/home/components/Carousel.vue`, `CarouselItem{Blog,News,Event,Poi,Project,Image}.vue`
- `layers/home/utils/carouselImage.ts` (neu); `layers/home/index.ts` nur, falls
  ein Wert von außerhalb der Schicht gebraucht wird (voraussichtlich nicht)
- `tests/home/` (neue Tests)
- Kein Render liest `route.query`, Cookies oder Header; die Seite bleibt
  edge-cachebar (`tests/architecture/request-independent-render.spec.ts`).
- Keine neuen Abhängigkeiten.
