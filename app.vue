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
    // Both values mirror --color-bg in assets/css/tailwind.css, which is
    // light-dark(#ffffff, #0b1020). Previously a single #0b1220 — one digit
    // off the dark token, and applied in light mode too, so the browser chrome
    // went dark on a white page.
    { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' },
    { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0b1020' },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'format-detection', content: 'telephone=no' }
  ]
})
</script>
<style>
@import "@/assets/css/tokens.css";
</style>
