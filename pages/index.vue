<script setup lang="ts">
import Carousel from '~/components/ui/carousel/Carousel.vue'

// Beispiel: Gemischte Slides (Image, Blog, News, Event)
// Hinweis: Das Carousel bleibt abwärtskompatibel – reine Bild‑Slides ohne `type`
// funktionieren weiterhin wie zuvor.
const slides = [
  // Legacy: reines Bild (ohne type)
  {
    src: '/images/blog/cyber-theDigitalArtist-Ethanol-Post.webp',
    alt: 'Künstliche Darstellung von Ethanol-Molekülen in leuchtenden Farben',
    note: 'Entdecke unsere technischen Beiträge – von Minecraft-Dev-Tools bis Infrastruktur.'
  },
  // Blog‑Artikel
  {
    type: 'blog',
    title: 'Minecraft Dev‑Tools: Unsere Roadmap 2025',
    href: '/blog/minecraft-dev-tools-roadmap-2025',
    excerpt: 'Ein Blick hinter die Kulissen: CLI‑Verbesserungen, Plugin‑Ökosystem und CI‑Pipelines.',
    image: '/images/blog/cyber-theDigitalArtist-Ethanol-Post.jpg',
    author: 'OneLiteFeather Team',
    date: '2025-11-10',
    tag: 'Blog'
  },
  // News
  {
    type: 'news',
    title: 'OneLiteFeather.net – neue Startseite ist live',
    summary: 'Überarbeitetes Design, schneller, zugänglicher. Schau dich um und gib uns Feedback!',
    href: '/news/site-refresh',
    image: '/logo.svg',
    date: '2025-11-15',
    tag: 'News'
  },
  // Event
  {
    type: 'event',
    title: 'Community Meetup & Tech Talk',
    dateStart: '2025-12-05T18:00:00+01:00',
    dateEnd: '2025-12-05T20:00:00+01:00',
    location: 'Discord',
    href: '/events/community-meetup-dec',
    image: '/images/blog/cyber-theDigitalArtist-Ethanol-Post.jpg',
    note: 'Austausch, Q&A und ein kurzer Talk zur Projektarchitektur.'
  },
  // Explizites Bild‑Slide (mit type)
  {
    type: 'image',
    src: '/logo.svg',
    alt: 'OneLiteFeather Logo',
    note: 'Willkommen bei OneLiteFeather.net – dein Hub für Tools, Content und Community.'
  }
]
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6 md:py-10">
    <Carousel :slides="slides" aspect="16/9" aria-label="Startseiten-Highlight-Karussell" />
  </div>
</template>

<style scoped>
/* Hinweise:
   - Eigene Bilder unter `public/` ablegen, z. B. `public/hero/slide1.jpg`.
   - Dann im Array oben `src: '/hero/slide1.jpg'` verwenden.
   - `alt` ist wichtig für Barrierefreiheit & SEO. `note` wird als Overlay-Text angezeigt. */
</style>