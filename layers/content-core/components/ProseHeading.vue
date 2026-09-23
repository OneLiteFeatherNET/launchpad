<script setup lang="ts">
import { computed, useI18n, useRuntimeConfig } from '#imports'

const props = withDefaults(defineProps<{
  id?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
}>(), {
  level: 1
})

const tag = computed(() => `h${props.level}`)

const headingClass = computed(() => {
  const base = 'mb-4 scroll-mt-24 break-words text-on-surface'
  // MD3 type scale per level; the weights keep the article's bold hierarchy.
  const sizeMap: Record<number, string> = {
    1: 'text-headline-large font-bold',
    2: 'text-headline-small font-semibold',
    3: 'text-title-large font-semibold',
    4: 'text-title-medium font-semibold',
    5: 'text-title-small font-semibold',
    6: 'text-title-small font-semibold'
  }
  return `${sizeMap[props.level] ?? sizeMap[2]} ${base}`
})

const anchorClass
  = 'rounded-extra-small break-words underline-offset-4 transition-colors hover:underline focus-ring'

const { headings } = useRuntimeConfig().public.mdc
const shouldGenerateAnchor = computed(() => {
  if (!props.id) return false
  if (typeof headings?.anchorLinks === 'boolean') {
    return headings.anchorLinks
  }
  if (typeof headings?.anchorLinks === 'object') {
    const key = `h${props.level}` as keyof typeof headings.anchorLinks
    return Boolean(headings.anchorLinks?.[key])
  }
  return false
})

const { t, te } = useI18n()
const permalinkLabel = computed(() => {
  const key = 'content.permalinkToHeading'
  return te(key) && props.id
    ? (t as any)(key, { id: props.id }) as string
    : `Permalink to heading ${props.id}`
})
</script>

<template>
  <component :is="tag" :id="props.id" :class="headingClass">
    <a
      v-if="shouldGenerateAnchor"
      :href="`#${props.id}`"
      :aria-label="permalinkLabel"
      :class="anchorClass"
    >
      <slot />
    </a>
    <slot v-else />
  </component>
</template>
