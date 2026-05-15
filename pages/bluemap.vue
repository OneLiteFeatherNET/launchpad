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
        <iframe
          :src="bluemapUrl"
          title="BlueMap"
          class="w-full h-[75vh] sm:h-[80vh]"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    </div>
  </section>
</template>
