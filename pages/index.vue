<script setup lang="ts">
import Carousel from "~/components/sections/carousel/Carousel.vue";
import ServerConcept from "~/components/sections/server-concept/ServerConcept.vue";
import ServerAddresses from "~/components/sections/server-addresses/ServerAddresses.vue";
import {definePageMeta} from "#imports";
const { locale, locales, t } = useI18n()

definePageMeta({
  title: 'index.title',
  layout: 'default',
});
// Server concept content from Nuxt Content (i18n)
const { data: conceptData } = await useAsyncData('server-concept-home', () => {
  // @ts-ignore queryCollection is provided by @nuxt/content
  return queryCollection('server_concept_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const concept = computed(() => (conceptData.value?.[0] as any) || null)

// Server Connect content from Nuxt Content (i18n)
const { data: connectData } = await useAsyncData('server-connect', () => {
  // @ts-ignore queryCollection is provided by @nuxt/content
  return queryCollection('server_connect_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const connect = computed(() => (connectData.value?.[0] as any) || null)

// Carousel content from Nuxt Content (i18n)
const { data: homeCarousel } = await useAsyncData('home-carousel', () => {
  // @ts-ignore queryCollection is provided by @nuxt/content
  return queryCollection('home_carousel_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const slides = computed(() => {
  const doc = homeCarousel.value?.[0] as { slides?: any[] } | undefined
  return doc?.slides ?? []
})

// SEO: meta, canonical and i18n alternate links (hreflang)
const route = useRoute()
const site = useSiteConfig()
const switchLocalePath = useSwitchLocalePath()

const canonicalUrl = computed(() => new URL(route.fullPath || '/', site.url).toString())

// Build hreflang alternate links for all configured locales + x-default
const alternateLinks = computed(() => {
  const items: Array<{ rel: 'alternate'; hreflang: string; href: string }> = []
  const all = Array.isArray(locales.value) ? locales.value : []
  for (const l of all as Array<any>) {
    const code = typeof l === 'string' ? l : l.code
    const iso = typeof l === 'string' ? l : (l.iso || l.code)
    const path = switchLocalePath(code) || '/'
    const href = new URL(path, site.url).toString()
    items.push({ rel: 'alternate', hreflang: iso, href })
  }
  // x-default falls back to current locale URL
  items.push({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl.value })
  return items
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    // Favicon kept for consistency
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ...alternateLinks.value,
  ]
}))

// Social preview image for OG/Twitter
const img = useImage()
const previewSocial = img('images/logo.svg', {
  width: 1200,
  height: 630,
  format: 'webp',
  quality: 80,
})

const pageTitle = computed(() => site.name)
const pageDescription = computed(() =>
  // If you later add i18n keys, replace this with t('home.meta.description')
  'OneLiteFeather is a Minecraft Network sharing development tools with the community.'
)

useSeoMeta(() => ({
  title: pageTitle.value,
  description: pageDescription.value,
  ogTitle: pageTitle.value,
  ogDescription: pageDescription.value,
  ogType: 'website',
  ogUrl: canonicalUrl.value,
  ogImage: previewSocial,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle.value,
  twitterDescription: pageDescription.value,
  twitterImage: previewSocial,
}))

useSchemaOrg(() => ({
  '@type': 'WebPage',
  name: pageTitle.value,
  description: pageDescription.value,
  url: canonicalUrl.value,
  inLanguage: (locale?.value || 'de'),
}))

</script>

<template>
  <!-- Full-bleed Carousel on mobile: remove outer padding and width limits; restore container on md+ -->
  <div class="-mx-4 sm:-mx-6 px-0 py-6 md:py-10 md:mx-auto md:max-w-6xl md:px-4 lg:px-8">
    <Carousel :slides="slides" aspect="16/9" aria-label="Startseiten-Highlight-Karussell" />
  </div>
  <!-- Server Concept Section -->
  <ServerConcept
    v-if="concept"
    :title="concept.title"
    :subtitle="concept.subtitle"
    :points="concept.points || []"
  />
  <!-- Server Connect Section -->
  <ServerAddresses
    v-if="connect"
    :java-address="connect.javaAddress"
    :bedrock-address="connect.bedrockAddress"
    :java-link="connect.javaLink"
    :bedrock-link="connect.bedrockLink"
  />
</template>

<style scoped>
/* Notes:
   - Place your own images under `public/`, e.g., `public/hero/slide1.jpg`.
   - Then reference it in the array above with `src: '/hero/slide1.jpg'`.
   - `alt` is important for accessibility & SEO. `note` is displayed as overlay text. */
</style>