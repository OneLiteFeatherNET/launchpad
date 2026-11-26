<script setup lang="ts">
import SkeletonBlock from './SkeletonBlock.vue'

/** A picture-shaped placeholder that keeps the aspect ratio of the real image. */
const { aspect = 'aspect-video', shape = 'none' } = defineProps<{
  /** A Tailwind aspect-ratio class, e.g. `aspect-video`. */
  aspect?: string
  shape?: 'none' | 'small' | 'medium' | 'large' | 'full'
}>()
</script>

<template>
  <SkeletonBlock class="w-full" :class="aspect" :shape="shape" />
</template>
