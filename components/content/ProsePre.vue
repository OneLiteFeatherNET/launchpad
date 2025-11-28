<template>
  <pre
    :class="[$props.class, 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-md overflow-auto transition-colors dark:text-white']"
    :tabindex="0"
    :aria-label="ariaLabel"
  ><slot /></pre>
</template>

<script setup lang="ts">
import { computed, useI18n } from '#imports'
const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: null
  },
  filename: {
    type: String,
    default: null
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  },
  meta: {
    type: String,
    default: null
  },
  class: {
    type: String,
    default: null
  }
})

const ariaLabel = computed(() => {
  const { t, te } = useI18n()
  const parts: string[] = []

  if (props.filename) {
    const key = 'content.file'
    const text = te(key)
      ? (t as any)(key, { filename: props.filename }) as string
      : `File ${props.filename}`
    parts.push(text)
  }

  if (props.language) {
    const key = 'content.codeIn'
    const text = te(key)
      ? (t as any)(key, { language: props.language }) as string
      : `Code in ${props.language}`
    parts.push(text)
  }

  if (parts.length === 0) {
    const key = 'content.codeblock'
    return te(key) ? (t as any)(key) as string : 'Code block'
  }
  return parts.join(', ')
})
</script>

<style>
pre code .line {
  display: block;
}
</style>