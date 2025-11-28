<template>
  <NuxtLink
      :href="props.href"
      :target="props.target"
      :rel="props.target === '_blank' ? 'noopener noreferrer' : undefined"
      class="text-blue-600 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm break-words"
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