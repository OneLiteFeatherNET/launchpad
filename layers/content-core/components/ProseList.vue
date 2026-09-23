<script setup lang="ts">
import { computed } from '#imports'

const props = withDefaults(defineProps<{
  ordered?: boolean
}>(), {
  ordered: false
})

const tag = computed(() => props.ordered ? 'ol' : 'ul')
const listClass = computed(() => {
  const marker = props.ordered ? 'list-decimal' : 'list-disc'
  return `mb-4 ps-4 text-body-large text-on-surface marker:text-on-surface-variant ${marker}`
})
</script>

<template>
  <component :is="tag" :class="listClass">
    <slot />
  </component>
</template>
