<script setup lang="ts">
import { computed } from '#imports'

const props = withDefaults(defineProps<{
  ordered?: boolean
}>(), {
  ordered: false
})

const tag = computed(() => props.ordered ? 'ol' : 'ul')
const listClass = computed(() => [
  'mb-4 ps-4 marker:text-gray-700 dark:marker:text-gray-300 dark:text-white transition-colors',
  props.ordered ? 'list-decimal' : 'list-disc'
])
</script>

<template>
  <component :is="tag" :class="listClass">
    <slot />
  </component>
</template>
