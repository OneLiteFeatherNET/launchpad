<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiStatus } from '~/types/community-poi'

const props = defineProps<{
  status: CommunityPoiStatus
}>()

const { t } = useI18n()

const label = computed(() => t(`community_poi.status.${props.status}`))

const sizing = 'px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'

const tone = computed(() => {
  switch (props.status) {
    case 'in-progress':
      return [
        'bg-amber-100 text-amber-900 ring-amber-300/60', 'dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/40'
      ].join(' ')
    case 'planning':
      return [
        'bg-sky-100 text-sky-900 ring-sky-300/60', 'dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-400/40'
      ].join(' ')
    case 'paused':
      return [
        'bg-neutral-100 text-neutral-800 ring-neutral-300/60', 'dark:bg-neutral-500/15 dark:text-neutral-200 dark:ring-neutral-400/40'
      ].join(' ')
    case 'completed':
      return [
        'bg-emerald-100 text-emerald-900 ring-emerald-300/60', 'dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/40'
      ].join(' ')
    default:
      return [
        'bg-neutral-100 text-neutral-800 ring-neutral-300/60', 'dark:bg-neutral-500/15 dark:text-neutral-200 dark:ring-neutral-400/40'
      ].join(' ')
  }
})
</script>

<template>
  <span :class="['inline-flex items-center gap-1.5 rounded-full', sizing, tone]">
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ label }}
  </span>
</template>
