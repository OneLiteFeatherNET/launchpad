<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <SeasonDecor />
</template>
<script setup lang="ts">
/**
 * Browser-chrome colour per scheme. Mirrors the MD3 --color-surface role in
 * assets/css/tailwind.css; tests/design-system/md3-tokens.spec.ts keeps the
 * two in step when the generated roles change. A season brings its own.
 */
const BASE_THEME_COLOR = { light: '#fbf8ff', dark: '#121319' }
const BASE_FAVICON = '/favicon.svg'

const season = useSeason()
const themeColor = computed(() => season.value?.themeColor ?? BASE_THEME_COLOR)
const favicon = computed(() => season.value?.favicon ?? BASE_FAVICON)

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | OneLiteFeather.net` : 'OneLiteFeather.net'
  },
  htmlAttrs: {
    // Hint browsers/embed previews about colour scheme support.
    'data-color-scheme': 'light dark',
    // Switches on the season's colours in assets/css/seasons.css. Absent for
    // most of the year, which keeps those rules inert.
    'data-season': () => season.value?.id
  },
  link: [
    { rel: 'manifest', href: '/site.webmanifest' },
    // Replaces the base icon from nuxt.config's app.head (same key) rather
    // than adding one: with two, the browser picks whichever it likes.
    { key: 'favicon', rel: 'icon', type: 'image/svg+xml', href: favicon },
    { rel: 'mask-icon', href: favicon, color: '#0b1020' }
  ],
  meta: [
    { name: 'application-name', content: 'OneLiteFeather' },
    { name: 'apple-mobile-web-app-title', content: 'OneLiteFeather' },
    { name: 'theme-color', media: '(prefers-color-scheme: light)', content: () => themeColor.value.light },
    { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: () => themeColor.value.dark },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'format-detection', content: 'telephone=no' }
  ]
})
</script>
<style>
@import "@/assets/css/tokens.css";
</style>
