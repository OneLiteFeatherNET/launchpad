<script setup lang="ts">
import { computed } from '#imports'
import type { ChipLabelColor } from '#layers/base'
import type { CommunityPoiCategory } from '../types'

const props = defineProps<{
  category: CommunityPoiCategory
}>()

const { t } = useI18n()

const label = computed(() => t(`community_poi.category.${props.category}`))

// Brand-aligned, now as role containers: team in brand purple, collab in the
// tertiary magenta, farm in primary, community in secondary.
const COLOR_BY_CATEGORY: Record<CommunityPoiCategory, ChipLabelColor> = {
  team: 'brand-purple',
  collab: 'tertiary',
  farm: 'primary',
  community: 'secondary',
}

const color = computed<ChipLabelColor>(() => COLOR_BY_CATEGORY[props.category] ?? 'secondary')
</script>

<template>
  <M3Chip kind="label" :color="color" :label="label" />
</template>
