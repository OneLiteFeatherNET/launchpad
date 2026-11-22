# Design: Das LCP-Bild der Startseite genau einmal und passend vorladen

## Context

Motivation: siehe `proposal.md`. Gelesen an `origin/main` `83fc3fe`,
`@nuxt/image` 2.2.1.

- `Carousel.vue:69-110`: `preloadLink` nimmt die erste Folie, baut mit
  `useImage()` ein `srcset` aus `[640, 1280]` (avif, q75) und setzt
  `imagesizes: '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1280px'`;
  `useHead` schreibt daraus einen Preload mit `fetchpriority: 'high'`.
- `CarouselItem{Blog,News,Event,Poi,Project,Image}.vue` rendern
  `<NuxtPicture sizes="sm:100vw md:100vw lg:1280px" densities="1x 2x"
  format="avif,webp" :preload="priority" :img-attrs="{ fetchpriority: … }">`.
  `Carousel.vue` reicht `:priority="i === 0"` im Default-Slot durch;
  `pages/index.vue:45` benutzt den Default-Slot.
- `NuxtPicture.vue` (Zeile 106-121): bei `preload` auf dem Server wird aus dem
  **ersten** `<source>` (avif) ein `<link rel="preload" as="image"
  imagesrcset imagesizes>` erzeugt. `fetchpriority` setzt es nur, wenn
  `preload` ein Objekt mit `fetchPriority` ist. Hier ist es `true`, also
  fehlt das Attribut. Das ist die Herkunft des zweiten Preloads; das
  `fetchpriority` auf dem `<img>` (`img-attrs`) ändert daran nichts.
- Die Screens (`nuxt.config.ts:260`) sind `sm 640, md 768, lg 1024`; die
  `sizes`-Kurzschreibweise macht daraus Medienbedingungen, deren Grenzen
  (767/1023) von den Hand-Werten des Preloads (768/1024) abweichen.
- Der Hand-Preload war nötig, solange `NuxtPicture` keine Priorität kannte;
  mit `preload: { fetchPriority }` ist er doppelt.

## Goals / Non-Goals

**Goals:** ein Preload, der dem gerenderten Kandidaten entspricht und
`fetchpriority="high"` trägt; Größenangaben aus einer Quelle.

**Non-Goals:** Bildformate, Qualität, Breitenstufen oder Layout der Folie
ändern; die Folgefolien (lazy) anfassen; das Karussell-Verhalten.

## Decisions

1. **Eine Größenkonstante `CAROUSEL_IMAGE_SIZES`** in
   `layers/home/utils/carouselImage.ts` im `NuxtPicture`-Format
   (`'sm:100vw md:100vw lg:1280px'`). Alle sechs Items binden sie an `sizes`.
   Wert und Verhalten bleiben gleich; das Literal verschwindet aus den
   Komponenten, ein neues Item kann nicht mehr abweichen.
2. **Den Preload `NuxtPicture` überlassen, den handgebauten streichen.**
   `NuxtPicture` leitet `imagesrcset`/`imagesizes` aus denselben Props ab wie
   das `<source>`, also stimmen sie per Konstruktion überein. Ein Hand-Preload
   müsste `sizes` in CSS-Form übersetzen, genau die Stelle, an der 768 und 767
   auseinanderliefen. `Carousel.vue` verliert `preloadLink`, das `useHead`
   und `useImage`. Alternative: Hand-Preload behalten und den
   `NuxtPicture`-Preload abschalten, dafür `img.getSizes()` mit derselben
   Konstante nutzen. Verworfen: zwei Wege, dieselbe Zahl zu berechnen, und der
   Slide-Typ-Switch (`image`, `blog`, `news`, …) im Hand-Preload müsste
   weiter mitwachsen.
3. **`:preload="priority ? { fetchPriority: 'high' } : false"`** in allen
   Items. Nur die erste Folie hat `priority`, also bleibt es bei einem Link.
   Ob `@nuxt/image` 2.2.1 das Objekt sauber durchreicht, bestätigt der Test
   (siehe Tasks).
4. **Projekt-Folie: nur das Hauptbild vorladen.** `CarouselItemProject.vue`
   hat ein zweites `NuxtPicture` (Logo, `sm:320px md:384px`) mit
   `:preload="priority"`. Es ist nicht das LCP-Element und würde, wäre die
   erste Folie ein Projekt, einen weiteren Preload erzeugen. Das Logo behält
   `loading="eager"`, verliert `preload`.
5. **Request-unabhängig.** Es kommt keine neue Eingabe hinzu; Konstante und
   Priorität (`i === 0`) hängen nur an Props. Kein `route.query`, kein Cookie.
6. **Typ `perf(home)`**: ein reiner Ladeverhalten-Fix ohne sichtbare Änderung.

## Risks / Trade-offs

- **`fetchpriority` im Preload nicht in allen Browsern.** Wo es ignoriert
  wird, bleibt der Preload ein normaler. Kein Rückschritt.
- **Messung lokal unmöglich.** Karussellbilder kommen nur über den
  `cloudflare`-Provider (`img.onelitefeather.net`); im lokalen Produktions-Build
  (Provider `none`) 404en sie, ein LCP wäre sinnlos. Gemessen wird deshalb
  gegen eine Workers-Version mit Cloudflare-Provider (Preview-URL), vorher und
  nachher auf gleiche Art.
- **Ein Preload weniger heißt:** wird die Folie nicht serverseitig gerendert,
  gäbe es keinen. Der Test deckt den SSR-Fall der ersten Folie ab.

## Open Questions

- Lässt sich eine Preview-Version mit Cloudflare-Provider
  (`NUXT_IMAGE_PROVIDER=cloudflare`) ohne Produktions-Deploy erzeugen? Sonst
  nur Messung gegen Produktion nach dem Release.
