<template>
  <component
    :is="componentToRender"
    :src="refinedSrc"
    :alt="props.alt"
    :width="props.width"
    :height="props.height"
    loading="lazy"
    decoding="async"
    class="max-w-full h-auto"
  />
</template>

<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from 'ufo'
import { useRuntimeConfig, computed } from '#imports'

import ImageComponent from '#build/mdc-image-component.mjs'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  }
})

const isInternal = computed(() => props.src?.startsWith('/') && !props.src.startsWith('//'))
const isSvg = computed(() => {
  const src = props.src
  if (!src) {
    return false
  }
  const [pathOnly] = src.split(/[?#]/)
  return pathOnly.toLowerCase().endsWith('.svg')
})

const refinedSrc = computed(() => {
  if (isInternal.value) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
    if (_base !== '/' && !props.src.startsWith(_base)) {
      return joinURL(_base, props.src)
    }
  }
  return props.src
})

const componentToRender = computed(() => (isInternal.value && !isSvg.value ? ImageComponent : 'img'))
</script>
