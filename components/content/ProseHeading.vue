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
  const base = 'mb-4 scroll-mt-24 break-words dark:text-white'
  const sizeMap: Record<number, string> = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-semibold',
    5: 'text-base font-semibold',
    6: 'text-base font-semibold'
  }
  return `${sizeMap[props.level] ?? sizeMap[2]} ${base}`
})

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
      class="hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-sm break-words transition-colors"
    >
      <slot />
    </a>
    <slot v-else />
  </component>
</template>
