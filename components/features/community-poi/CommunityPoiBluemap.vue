<script setup lang="ts">
import { ref, computed } from '#imports'
import { useBluemapDeepLink, useBluemapUrl } from '~/composables/useBluemap'
import type { CommunityPoiCoordinates } from '~/types/community-poi'

const props = defineProps<{
  title: string
  coordinates: CommunityPoiCoordinates
}>()

const { t } = useI18n()
const baseUrl = useBluemapUrl()

const deepLink = computed(() => useBluemapDeepLink({
    x: props.coordinates.x,
    y: props.coordinates.y,
    z: props.coordinates.z,
    dimension: props.coordinates.dimension
  }))

const dimensionLabel = computed(() => {
  const dim = props.coordinates.dimension
  return dim ? t(`community_poi.dimension.${dim}`) : ''
})

const coordsLabel = computed(() => {
  const c = props.coordinates
  const parts = c.y !== undefined ? [c.x,
c.y,
c.z] : [c.x, c.z]
  return parts.join(' / ')
})

const showEmbed = ref(false)
const toggleEmbed = () => {
  showEmbed.value = !showEmbed.value
}

const linkAria = computed(() => t('community_poi.bluemap.link_aria', { title: props.title }))

const wrapperClass = [
  'rounded-lg border border-neutral-200 bg-white p-5', 'dark:border-neutral-800 dark:bg-neutral-900'
].join(' ')

const linkClass = [
  'inline-flex items-center gap-2 rounded-md',
  'bg-[var(--color-brand,#0ea5e9)] px-3 py-1.5 text-sm font-medium text-white shadow-sm',
  'hover:opacity-90 focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary,#6366f1)] focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900'
].join(' ')

const embedNoteClass = [
  'bg-neutral-50 px-3 py-2 text-xs text-neutral-600', 'dark:bg-neutral-800 dark:text-neutral-400'
].join(' ')

const toggleClass = [
  'inline-flex items-center gap-1 rounded-md border border-neutral-200',
  'px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary,#6366f1)]',
  'dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800'
].join(' ')
</script>

<template>
  <section :class="wrapperClass" :aria-label="t('community_poi.bluemap.aria')">
    <header class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          <span aria-hidden="true" class="mr-1">🗺</span>
          {{ t('community_poi.bluemap.title') }}
        </h3>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          <span class="font-mono">{{ coordsLabel }}</span>
          <span v-if="dimensionLabel" class="ml-1">({{ dimensionLabel }})</span>
        </p>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <a
        :href="deepLink"
        target="_blank"
        rel="noopener noreferrer external"
        :class="linkClass"
        :aria-label="linkAria"
      >
        <span aria-hidden="true">↗</span>
        {{ t('community_poi.bluemap.open') }}
      </a>
      <button
        type="button"
        :class="toggleClass"
        :aria-expanded="showEmbed ? 'true' : 'false'"
        aria-controls="community-poi-bluemap-embed"
        @click="toggleEmbed"
      >
        <span aria-hidden="true">{{ showEmbed ? '–' : '+' }}</span>
        {{ showEmbed
          ? t('community_poi.bluemap.hide_preview')
          : t('community_poi.bluemap.show_preview') }}
      </button>
    </div>

    <div
      v-if="showEmbed"
      id="community-poi-bluemap-embed"
      class="mt-4 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
    >
      <iframe
        :src="deepLink"
        :title="t('community_poi.bluemap.iframe_title', { title: props.title })"
        class="block aspect-[16/9] w-full"
        loading="lazy"
        allow="fullscreen"
        referrerpolicy="no-referrer"
      />
      <p :class="embedNoteClass">
        {{ t('community_poi.bluemap.embed_note', { host: baseUrl }) }}
      </p>
    </div>
  </section>
</template>
