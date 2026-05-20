<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiCategory } from '~/types/community-poi'

const props = defineProps<{
  category: CommunityPoiCategory
}>()

const { t } = useI18n()

const label = computed(() => t(`community_poi.category.${props.category}`))

const tone = computed(() => {
  switch (props.category) {
    case 'team':
      return [
        'bg-violet-100 text-violet-900 ring-violet-300/60', 'dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/40'
      ].join(' ')
    case 'collab':
      return [
        'bg-fuchsia-100 text-fuchsia-900 ring-fuchsia-300/60', 'dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:ring-fuchsia-400/40'
      ].join(' ')
    case 'community':
    default:
      return [
        'bg-teal-100 text-teal-900 ring-teal-300/60', 'dark:bg-teal-500/15 dark:text-teal-200 dark:ring-teal-400/40'
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
