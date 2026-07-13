<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiCategory } from '~/types/community-poi'

const props = defineProps<{
  category: CommunityPoiCategory
}>()

const { t } = useI18n()

const label = computed(() => t(`community_poi.category.${props.category}`))

// Brand-aligned palette: team uses brand purple, community uses brand
// secondary (cyan-blue), collab uses brand accent (magenta), farm uses
// brand primary (green) since farms are typically green-themed.
const tone = computed(() => {
  switch (props.category) {
    case 'team':
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-purple)_15%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-purple)_75%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-purple)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-purple)_28%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-purple)_30%,white)]'
      ].join(' ')
    case 'collab':
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-accent)_15%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-accent)_70%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-accent)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-accent)_28%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-accent)_30%,white)]'
      ].join(' ')
    case 'farm':
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-primary)_15%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-primary)_75%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-primary)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-primary)_28%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-primary)_30%,white)]'
      ].join(' ')
    case 'community':
    default:
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-secondary)_15%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-secondary)_75%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-secondary)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-secondary)_25%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-secondary)_30%,white)]'
      ].join(' ')
  }
})

const sizing = 'px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
</script>

<template>
  <span :class="['inline-flex items-center gap-1.5 rounded-full', sizing, tone]">
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ label }}
  </span>
</template>
