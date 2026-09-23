<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | OneLiteFeather.net` : 'OneLiteFeather.net'
  },
  htmlAttrs: {
    // Hint browsers/embed previews about colour scheme support.
    'data-color-scheme': 'light dark'
  },
  link: [
    { rel: 'manifest', href: '/site.webmanifest' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'mask-icon', href: '/favicon.svg', color: '#0b1020' }
  ],
  meta: [
    { name: 'application-name', content: 'OneLiteFeather' },
    { name: 'apple-mobile-web-app-title', content: 'OneLiteFeather' },
    // Both values mirror the MD3 --color-surface role in
    // assets/css/tailwind.css; tests/design-system/md3-tokens.spec.ts keeps
    // them in step when the generated roles change.
    { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#fbf8ff' },
    { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#121319' },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'format-detection', content: 'telephone=no' }
  ]
})
</script>
<style>
@import "@/assets/css/tokens.css";
</style>
