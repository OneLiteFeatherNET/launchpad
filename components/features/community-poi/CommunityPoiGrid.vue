<script setup lang="ts">
import CommunityPoiCard from './CommunityPoiCard.vue'
import type { CommunityPoi } from '~/types/community-poi'

defineProps<{
  pois: CommunityPoi[]
}>()

const { t } = useI18n()

const emptyClass = [
  'rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm', 'text-neutral-600 dark:border-neutral-700 dark:text-neutral-400'
].join(' ')
</script>

<template>
  <div>
    <ul
      v-if="pois.length"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li v-for="poi in pois" :key="poi.slug" class="relative">
        <CommunityPoiCard :poi="poi" />
      </li>
    </ul>
    <p v-else :class="emptyClass">
      {{ t('community_poi.overview.empty') }}
    </p>
  </div>
</template>
