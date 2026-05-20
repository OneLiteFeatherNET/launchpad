<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiStatus } from '~/types/community-poi'

const props = defineProps<{
  status: CommunityPoiStatus
}>()

const { t } = useI18n()

const label = computed(() => t(`community_poi.status.${props.status}`))

// Brand-aligned tones via color-mix over the project's token palette. Keeps
// the badges on-brand while still differentiating each status visually.
const tone = computed(() => {
  switch (props.status) {
    case 'in-progress':
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-orange)_18%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-orange)_70%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-orange)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-orange)_22%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-orange)_30%,white)]'
      ].join(' ')
    case 'planning':
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-secondary)_15%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-secondary)_70%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-secondary)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-secondary)_22%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-secondary)_30%,white)]'
      ].join(' ')
    case 'paused':
      return [
        'bg-neutral-100 text-neutral-700 ring-neutral-300/60', 'dark:bg-neutral-500/15 dark:text-neutral-200 dark:ring-neutral-400/40'
      ].join(' ')
    case 'completed':
      return [
        'bg-[color-mix(in_oklab,var(--color-brand-primary)_15%,white)]',
        'text-[color-mix(in_oklab,var(--color-brand-primary)_75%,black)]',
        'ring-[color-mix(in_oklab,var(--color-brand-primary)_40%,transparent)]',
        'dark:bg-[color-mix(in_oklab,var(--color-brand-primary)_28%,transparent)]',
        'dark:text-[color-mix(in_oklab,var(--color-brand-primary)_30%,white)]'
      ].join(' ')
    default:
      return 'bg-neutral-100 text-neutral-800 ring-neutral-300/60'
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
