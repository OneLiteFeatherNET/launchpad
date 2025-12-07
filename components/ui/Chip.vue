<template>
  <component
    :is="componentTag"
    v-bind="componentAttrs"
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium leading-none transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="[variantClasses, selected && selectedClasses]"
    :aria-pressed="componentTag === 'button' ? String(selected) : undefined"
  >
    <span v-if="$slots.icon" class="text-base leading-none">
      <slot name="icon" />
    </span>
    <span class="whitespace-nowrap">
      <slot>{{ label }}</slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from '#imports'

const props = withDefaults(
  defineProps<{
    label: string
    variant?: 'tonal' | 'elevated' | 'outlined'
    selected?: boolean
    to?: string
    href?: string
    as?: 'button' | 'span'
  }>(),
  {
    variant: 'tonal',
    selected: false,
    as: 'button'
  }
)

const componentTag = computed(() => {
  if (props.to) return 'NuxtLink'
  if (props.href) return 'a'
  return props.as
})

const componentAttrs = computed(() => {
  if (componentTag.value === 'NuxtLink') return { to: props.to }
  if (componentTag.value === 'a') return { href: props.href }
  if (componentTag.value === 'button') return { type: 'button' }
  return {}
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'elevated':
      return 'bg-white/90 text-neutral-900 border-black/5 shadow-sm hover:shadow-md dark:bg-white/15 dark:text-white dark:border-white/15'
    case 'outlined':
      return 'border-border text-neutral-800 hover:bg-black/5 dark:text-white dark:border-white/25 dark:hover:bg-white/10'
    default:
      return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 dark:bg-white/20 dark:text-white dark:border-white/30 dark:hover:bg-white/30'
  }
})

const selectedClasses =
  'bg-primary/20 text-primary border-primary/40 shadow-sm hover:bg-primary/25 dark:bg-white/40 dark:text-black dark:border-white/50 dark:hover:bg-white/50'
</script>
