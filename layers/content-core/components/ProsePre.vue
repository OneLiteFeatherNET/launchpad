<template>
  <pre
    :class="[$props.class, 'overflow-auto rounded-small bg-surface-container-highest p-4 focus-ring']"
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

// At setup level, not inside the getter below. A composable resolves its
// component via getCurrentInstance(), which is only set during setup — inside
// a computed it happens to work because Vue falls back to the *rendering*
// instance, and only while that getter runs as part of a render.
const { t, te } = useI18n()

const ariaLabel = computed(() => {
  const parts: string[] = []

  if (props.filename) {
    const key = 'content.file'
    const text = te(key)
      ? t(key, { filename: props.filename })
      : `File ${props.filename}`
    parts.push(text)
  }

  if (props.language) {
    const key = 'content.codeIn'
    const text = te(key)
      ? t(key, { language: props.language })
      : `Code in ${props.language}`
    parts.push(text)
  }

  if (parts.length === 0) {
    const key = 'content.codeblock'
    return te(key) ? t(key) : 'Code block'
  }
  return parts.join(', ')
})
</script>

<style>
pre code .line {
  display: block;
}
</style>