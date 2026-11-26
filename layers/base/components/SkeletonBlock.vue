<script setup lang="ts">
/**
 * A placeholder surface shown while content loads. Colour and radius come
 * from the MD3 tokens; the pulse is switched off under
 * `prefers-reduced-motion`, leaving a calm flat surface.
 */
const { shape = 'medium' } = defineProps<{
  /** Radius token, matching the shape of the content it stands in for. */
  shape?: 'none' | 'small' | 'medium' | 'large' | 'full'
}>()

const SHAPES = {
  none: '',
  small: 'rounded-small',
  medium: 'rounded-medium',
  large: 'rounded-large',
  full: 'rounded-full',
} as const
</script>

<template>
  <div
    aria-hidden="true"
    class="bg-surface-container-high motion-safe:animate-pulse"
    :class="SHAPES[shape]"
  />
</template>
