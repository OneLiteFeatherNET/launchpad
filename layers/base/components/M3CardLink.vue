<script setup lang="ts">
import { resolveComponent } from 'vue'
import { useInteractiveTag } from '../composables/useInteractiveTag'
import { M3_CARD_LINK } from '../utils/m3Variants'

/**
 * The one link of an interactive M3Card, placed around its title. It
 * stretches over the whole card; see M3Card.
 */
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  target?: string
}>(), {
  to: undefined,
  href: undefined,
  target: undefined,
})

const { component, attrs } = useInteractiveTag(() => props, resolveComponent('NuxtLink'))
</script>

<template>
  <component :is="component" v-bind="attrs" :class="M3_CARD_LINK">
    <slot />
  </component>
</template>
