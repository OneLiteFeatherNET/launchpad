<script setup lang="ts">
import { CAROUSEL_SCRIM } from '../utils/carouselClasses'
// Image slide: full-bleed image with optional overlay text (note)

interface Props {
  item: {
    type: 'image'
    src: string
    alt: string
    note?: string
  }
  /** Mark the slide as priority (used for the first/LCP image) */
  priority?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  priority: false
})


const noteClass
  = 'inline-block max-w-3xl rounded-small bg-surface-container-high/90 px-3 py-1.5 '
    + 'text-body-medium text-on-surface backdrop-blur-sm'

// md:p-4 would reset the bottom padding, so md: repeats it.
const notePositionClass
  = 'pointer-events-none absolute inset-x-0 bottom-0 p-3 pb-(--carousel-dots-space) '
    + 'md:p-4 md:pb-(--carousel-dots-space)'
</script>

<template>
  <div class="absolute inset-0 h-full w-full">
    <!-- Raster images via NuxtPicture without blur placeholder and with 2x density -->
    <NuxtPicture
      :src="props.item.src"
      :alt="props.item.alt"
      sizes="sm:100vw md:100vw lg:1280px"
      densities="1x 2x"
      quality="75"
      :placeholder="false"
      format="avif,webp"
      :loading="props.priority ? 'eager' : 'lazy'"
      :preload="props.priority"
      :img-attrs="{
        class: 'absolute inset-0 h-full w-full object-cover object-center',
        fetchpriority: props.priority ? 'high' : undefined
      }"
    />
    <div :class="CAROUSEL_SCRIM" class="pointer-events-none" />
    <div :class="notePositionClass">
      <p
        v-if="props.item.note"
        :class="noteClass"
      >
        {{ props.item.note }}
      </p>
    </div>
  </div>

</template>
