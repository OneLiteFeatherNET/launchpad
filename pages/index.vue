<script setup lang="ts">
import Carousel from '~/components/ui/carousel/Carousel.vue'
import VerticalTimeline from '~/components/ui/timeline/VerticalTimeline.vue'
import type { TimelineEvent } from '~/types/timeline'
import ServerAddresses from '~/components/sections/ServerAddresses.vue'
const { locale } = useI18n()

// Timeline-Inhalte aus Nuxt Content (i18n)
// Wir nutzen je Sprache eine eigene Collection: timeline_de / timeline_en
const { data: timelineData } = await useAsyncData('timeline-home', () => {
  // @ts-ignore queryCollection ist von @nuxt/content bereitgestellt
  return queryCollection('timeline_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const timelineEvents = computed<TimelineEvent[]>(() => {
  const doc = timelineData.value?.[0] as { events?: TimelineEvent[] } | undefined
  return doc?.events ?? []
})

// Server Connect content from Nuxt Content (i18n)
const { data: connectData } = await useAsyncData('server-connect', () => {
  // @ts-ignore queryCollection is provided by @nuxt/content
  return queryCollection('server_connect_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const connect = computed(() => (connectData.value?.[0] as any) || null)

// Carousel-Inhalte aus Nuxt Content (i18n)
const { data: homeCarousel } = await useAsyncData('home-carousel', () => {
  // @ts-ignore queryCollection wird von @nuxt/content bereitgestellt
  return queryCollection('home_carousel_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const slides = computed(() => {
  const doc = homeCarousel.value?.[0] as { slides?: any[] } | undefined
  return doc?.slides ?? []
})

</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6 md:py-10">
    <Carousel :slides="slides" aspect="16/9" aria-label="Startseiten-Highlight-Karussell" />
  </div>
  <!-- Server Connect Section -->
  <ServerAddresses
    v-if="connect"
    :java-address="connect.javaAddress"
    :bedrock-address="connect.bedrockAddress"
    :java-link="connect.javaLink"
    :bedrock-link="connect.bedrockLink"
  />
  <div class="mx-auto max-w-6xl px-4 pb-16">
    <h2 class="mt-4 mb-6 text-2xl font-bold inline-block bg-gradient-accent bg-clip-text text-transparent">Roadmap</h2>
    <VerticalTimeline :events="timelineEvents" line-color="brand" mode="preview" aria-label="Projekt‑Roadmap" />
  </div>
</template>

<style scoped>
/* Hinweise:
   - Eigene Bilder unter `public/` ablegen, z. B. `public/hero/slide1.jpg`.
   - Dann im Array oben `src: '/hero/slide1.jpg'` verwenden.
   - `alt` ist wichtig für Barrierefreiheit & SEO. `note` wird als Overlay-Text angezeigt. */
</style>