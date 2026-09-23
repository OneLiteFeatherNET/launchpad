<script setup lang="ts">
import { computed } from 'vue'
import type { CardVariant } from '../types'
import {
  M3_CARD_BASE,
  M3_CARD_INTERACTIVE,
  M3_CARD_INTERACTIVE_ELEVATED,
  M3_CARD_VARIANTS,
} from '../utils/m3Variants'

/**
 * MD3 card: a surface with optional `media`, the default content slot and an
 * `actions` row.
 *
 * A card that leads somewhere is `interactive` and puts exactly one
 * M3CardLink in its content, usually around the title. That link covers the
 * whole card, so the card is one tab stop whose name is the title — not the
 * whole card text — and links inside the content (an excerpt, say) no longer
 * end up nested in another link. Anything in `actions` sits above the
 * stretched link and stays separately reachable.
 */
const props = withDefaults(defineProps<{
  variant?: CardVariant
  interactive?: boolean
  /** Root element; `article` for a self-contained item such as a post. */
  as?: string
}>(), {
  variant: 'elevated',
  interactive: false,
  as: 'div',
})

const classes = computed(() => [
  M3_CARD_BASE,
  M3_CARD_VARIANTS[props.variant],
  props.interactive && M3_CARD_INTERACTIVE,
  props.interactive && props.variant === 'elevated' && M3_CARD_INTERACTIVE_ELEVATED,
])
</script>

<template>
  <component :is="as" :class="classes">
    <div v-if="$slots.media" class="relative">
      <slot name="media" />
    </div>
    <div class="flex flex-1 flex-col p-4">
      <slot />
    </div>
    <div v-if="$slots.actions" class="relative z-10 flex flex-wrap items-center gap-2 px-4 pb-4">
      <slot name="actions" />
    </div>
  </component>
</template>
