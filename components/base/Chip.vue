<template>
  <component
    :is="componentTag"
    v-bind="componentAttrs"
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
      return 'bg-white text-neutral-900 border-black/5 shadow-sm hover:shadow-md dark:bg-white/10 dark:text-white dark:border-white/10 dark:shadow-[0_8px_24px_-14px_rgba(15,23,42,0.45)] dark:hover:shadow-[0_12px_36px_-12px_rgba(15,23,42,0.55)]'
    case 'outlined':
      return 'bg-transparent border-border text-neutral-800 hover:bg-black/5 dark:text-white dark:border-white/25 dark:hover:bg-white/10'
    default:
      return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 dark:bg-white/15 dark:text-white dark:border-white/25 dark:hover:bg-white/25'
  }
})

const selectedClasses =
  'bg-primary/20 text-primary border-primary/40 shadow-sm hover:bg-primary/25 dark:bg-white/35 dark:text-black dark:border-white/45 dark:hover:bg-white/45'
</script>
