<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { BluemapCoordinates } from '../types'

const props = defineProps<{
  title: string
  coordinates: BluemapCoordinates
}>()

const { t } = useI18n()
const baseUrl = useBluemapUrl()
const mapIds = useBluemapMapIds()

const loaded = ref(false)
const frame = ref<HTMLIFrameElement | null>(null)

// The viewer is ~70 MB of requests, so it mounts only when asked for.
async function loadMap() {
  loaded.value = true
  await nextTick()
  // The button is gone; focus the map so keyboard users land in it.
  frame.value?.focus()
}

const deepLink = computed(() => bluemapDeepLink(baseUrl, props.coordinates, mapIds))

const dimensionLabel = computed(() => {
  const dim = props.coordinates.dimension
  return dim ? t(`bluemap.dimension.${dim}`) : ''
})

const coordsLabel = computed(() => {
  const { x, y, z } = props.coordinates
  return y !== undefined ? `${x} / ${y} / ${z}` : `${x} / ${z}`
})

const linkAria = computed(() => t('bluemap.facade.link_aria', { title: props.title }))

const wrapperClass = 'rounded-large border border-outline-variant bg-surface-container-low p-5'

const titleClass = 'inline-flex items-center gap-2 text-title-medium text-on-surface'

const iconClass = 'h-4 w-4 text-primary'

const embedNoteClass
  = 'bg-surface-container-highest px-3 py-2 text-body-small text-on-surface-variant'

// Same 16:9 box as the iframe, so activating the map does not shift the page.
const placeholderClass
  = 'flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 bg-surface-container-high p-4 text-center'

// Nothing here animates; the guard covers the button's colour transition.
const buttonClass = 'motion-reduce:transition-none'
</script>

<template>
  <section :class="wrapperClass" :aria-label="t('bluemap.facade.aria')">
    <header class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 :class="titleClass">
          <IconFa :icon="['fas', 'map']" :class="iconClass" aria-hidden="true" />
          {{ t('bluemap.facade.heading') }}
        </h3>
        <p class="mt-1 text-body-medium text-on-surface-variant">
          <span class="text-on-surface">{{ title }}</span>
          <span class="ml-2 font-mono">{{ coordsLabel }}</span>
          <span v-if="dimensionLabel" class="ml-1">({{ dimensionLabel }})</span>
        </p>
      </div>
      <M3Button
        :href="deepLink"
        target="_blank"
        rel="noopener noreferrer external"
        :icon="['fas', 'arrow-up-right-from-square']"
        :aria-label="linkAria"
        :class="buttonClass"
      >
        {{ t('bluemap.facade.open') }}
      </M3Button>
    </header>

    <slot />

    <div class="overflow-hidden rounded-medium border border-outline-variant">
      <div v-if="!loaded" :class="placeholderClass">
        <p class="text-body-medium text-on-surface-variant">
          {{ t('bluemap.facade.load_hint') }}
        </p>
        <M3Button variant="tonal" :icon="['fas', 'play']" :class="buttonClass" @click="loadMap">
          {{ t('bluemap.facade.load') }}
        </M3Button>
      </div>
      <!-- Same sandbox as pages/bluemap.vue; see the comment there for why
           allow-scripts and allow-same-origin are both needed. -->
      <iframe
        v-else
        ref="frame"
        :src="deepLink"
        :title="t('bluemap.facade.iframe_title', { title })"
        class="block aspect-[16/9] w-full"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups"
        referrerpolicy="no-referrer"
      />
      <p :class="embedNoteClass">
        {{ t('bluemap.facade.embed_note', { host: baseUrl }) }}
      </p>
    </div>
  </section>
</template>
