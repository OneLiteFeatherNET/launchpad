<script setup lang="ts">
import { computed } from '#imports'
import CommunityPoiCoordsCopy from './CommunityPoiCoordsCopy.vue'
import { useBluemapDeepLink, useBluemapUrl } from '~/composables/useBluemap'
import type { CommunityPoiCoordinates } from '../types'

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

const wrapperClass = 'rounded-large border border-outline-variant bg-surface-container-low p-5'

const titleClass = 'inline-flex items-center gap-2 text-title-medium text-on-surface'

const iconClass = 'h-4 w-4 text-primary'

const embedNoteClass
  = 'bg-surface-container-highest px-3 py-2 text-body-small text-on-surface-variant'
</script>

<template>
  <section :class="wrapperClass" :aria-label="t('community_poi.bluemap.aria')">
    <header class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 :class="titleClass">
          <IconFa :icon="['fas','map']" :class="iconClass" aria-hidden="true" />
          {{ t('community_poi.bluemap.title') }}
        </h3>
        <p class="mt-1 text-body-medium text-on-surface-variant">
          <span class="font-mono">{{ coordsLabel }}</span>
          <span v-if="dimensionLabel" class="ml-1">({{ dimensionLabel }})</span>
        </p>
      </div>
      <M3Button
        :href="deepLink"
        target="_blank"
        rel="noopener noreferrer external"
        :icon="['fas','arrow-up-right-from-square']"
        :aria-label="linkAria"
      >
        {{ t('community_poi.bluemap.open') }}
      </M3Button>
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
    <div class="overflow-hidden rounded-medium border border-outline-variant">
      <!-- Same sandbox as pages/bluemap.vue; see the comment there for why
           allow-scripts and allow-same-origin are both needed. -->
      <iframe
        :src="deepLink"
        :title="t('community_poi.bluemap.iframe_title', { title: props.title })"
        class="block aspect-[16/9] w-full"
        loading="lazy"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups"
        referrerpolicy="no-referrer"
      />
      <p :class="embedNoteClass">
        {{ t('community_poi.bluemap.embed_note', { host: baseUrl }) }}
      </p>
    </div>
  </section>
</template>
