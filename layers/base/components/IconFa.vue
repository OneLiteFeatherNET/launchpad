<script setup lang="ts">
// Renders a Font Awesome icon definition as an inline <svg>. No runtime
// library: the path and viewBox come straight from the definition.
import { computed } from 'vue'
import type { IconName } from '../types'
import { findRegisteredIcon } from '../utils/iconRegistry'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  icon: IconName;
}>()

// Accepts 'home', ['fas', 'home'] or an imported definition such as faHome.
const definition = computed(() => {
  const icon = props.icon
  if (typeof icon === 'string') return findRegisteredIcon('fas', icon)
  if (Array.isArray(icon)) return findRegisteredIcon(icon[0], icon[1])
  return icon
})

// Only single-path (non-duotone) icons are used on this site.
const path = computed(() => [definition.value?.icon[4] ?? ''].flat().join(''))
</script>

<template>
  <svg
    v-if="definition"
    class="svg-inline--fa"
    role="img"
    aria-hidden="true"
    :viewBox="`0 0 ${definition.icon[0]} ${definition.icon[1]}`"
    v-bind="$attrs"
  >
    <path fill="currentColor" :d="path" />
  </svg>
</template>

<style>
/* The rule the Font Awesome stylesheet used to apply to every icon. It is
   unlayered on purpose: it beat the Tailwind size utilities before, so icons
   keep their size by the font (1em tall, 1.25em wide). */
.svg-inline--fa {
  box-sizing: content-box;
  display: inline-block;
  vertical-align: -0.125em;
  height: 1em;
  width: 1.25em;
  overflow: visible;
}
</style>
