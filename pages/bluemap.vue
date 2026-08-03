<script setup lang="ts">
import { definePageMeta } from '#imports'
const { t, locale } = useI18n()
const bluemapUrl = useBluemapUrl();

definePageMeta({
  title: 'bluemap.title'
})

usePageSeo({
  title: t('bluemap.title'),
  description: t('bluemap.description'),
  schemaType: 'WebPage',
  keywords: [
    'OneLiteFeather BlueMap',
    'Minecraft world map',
    'Minecraft 3D map',
    'Minecraft live map',
    'OneLiteFeather server'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}/` }, { name: t('bluemap.title') }
])
</script>

<template>
  <section class="py-6 sm:py-8">
    <div class="mx-auto max-w-screen-2xl">
      <div class="mb-4">
        <h1 class="text-2xl font-semibold text-[var(--color-text)]">BlueMap</h1>
      </div>
      <div class="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        <!--
          The embed is third-party by origin and its URL comes from runtime
          config, so this page cannot assume the content stays what it is.

          allow-scripts and allow-same-origin are both required — it is a WebGL
          map keeping state in its own storage. Together they do let a
          same-origin frame drop its own sandbox; that does not apply here
          because the embed is cross-origin. What stays withheld is the part
          that matters: top-level navigation, so the frame cannot replace this
          tab, plus modals, downloads and pointer lock.
        -->
        <iframe
          :src="bluemapUrl"
          title="BlueMap"
          class="w-full h-[75vh] sm:h-[80vh]"
          loading="lazy"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups"
          referrerpolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  </section>
</template>
