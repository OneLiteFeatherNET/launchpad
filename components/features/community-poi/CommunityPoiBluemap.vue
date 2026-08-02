<script setup lang="ts">
import { computed } from '#imports'
import CommunityPoiCoordsCopy from './CommunityPoiCoordsCopy.vue'
import IconFa from '~/components/base/icons/IconFa.vue'
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

const linkAria = computed(() => t('community_poi.bluemap.link_aria', { title: props.title }))

const wrapperClass = [
  'rounded-lg border p-5', 'border-[var(--color-border)] bg-[var(--color-surface)]'
].join(' ')

const titleClass = [
  'inline-flex items-center gap-2 text-base font-semibold', 'text-neutral-900 dark:text-neutral-50'
].join(' ')

const iconClass = 'h-4 w-4 text-[var(--color-brand-secondary)]'

const linkClass = [
  'inline-flex items-center gap-2 rounded-md',
  'bg-[var(--color-brand-secondary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm',
  'hover:opacity-90 focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900'
].join(' ')

const embedNoteClass = [
  'bg-neutral-50 px-3 py-2 text-xs text-neutral-600', 'dark:bg-neutral-800 dark:text-neutral-400'
].join(' ')
</script>

<template>
  <section :class="wrapperClass" :aria-label="t('community_poi.bluemap.aria')">
    <header class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 :class="titleClass">
          <IconFa :icon="['fas','map']" :class="iconClass" aria-hidden="true" />
          {{ t('community_poi.bluemap.title') }}
        </h3>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          <span class="font-mono">{{ coordsLabel }}</span>
          <span v-if="dimensionLabel" class="ml-1">({{ dimensionLabel }})</span>
        </p>
      </div>
      <a
        :href="deepLink"
        target="_blank"
        rel="noopener noreferrer external"
        :class="linkClass"
        :aria-label="linkAria"
      >
        <IconFa
          :icon="['fas','arrow-up-right-from-square']"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        />
        {{ t('community_poi.bluemap.open') }}
      </a>
    </header>

    <CommunityPoiCoordsCopy
      class="mb-3"
      :x="coordinates.x"
      :y="coordinates.y"
      :z="coordinates.z"
    />

    <!-- The iframe is loaded by default so every POI lands on its
         in-world position immediately. `loading="lazy"` still defers the
         fetch until the section is in view, which keeps initial page
         weight reasonable. -->
    <div class="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
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
