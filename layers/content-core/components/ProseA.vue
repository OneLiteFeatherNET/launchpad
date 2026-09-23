<template>
  <NuxtLink
      :href="props.href"
      :target="props.target"
      :rel="props.target === '_blank' ? 'noopener noreferrer' : undefined"
      :class="linkClass"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

// Always underlined: in running text the link colour alone is not a
// guaranteed 3:1 against the body colour (WCAG 1.4.1).
const linkClass
  = 'rounded-extra-small break-words text-primary underline underline-offset-4 '
    + 'transition-colors hover:decoration-2 focus-ring'

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