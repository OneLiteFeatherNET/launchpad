<template>
  <NuxtLink
      :href="props.href"
      :target="props.target"
      :rel="props.target === '_blank' ? 'noopener noreferrer' : undefined"
      class="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-sm break-words transition-colors"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  href: {
    type: String,
    default: ''
  },
  target: {
    type: String as PropType<'_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined>,
    default: undefined,
    required: false
  }
})
</script>