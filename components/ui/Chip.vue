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
      return 'bg-white/90 dark:bg-surface/80 border-black/5 dark:border-white/10 shadow-sm hover:shadow-md text-neutral-900 dark:text-neutral-50'
    case 'outlined':
      return 'border-border text-neutral-800 dark:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/5'
    default:
      return 'bg-primary/10 text-primary dark:text-primary-fg border-primary/20 hover:bg-primary/15 dark:hover:bg-primary/20'
  }
})

const selectedClasses =
  'bg-primary/20 text-primary dark:text-primary-fg border-primary/40 shadow-sm hover:bg-primary/25 dark:hover:bg-primary/25'
</script>
