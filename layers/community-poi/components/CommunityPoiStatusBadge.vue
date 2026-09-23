<script setup lang="ts">
import { computed } from '#imports'
import type { ChipLabelColor } from '#layers/base'
import type { CommunityPoiStatus } from '../types'

const props = defineProps<{
  status: CommunityPoiStatus
}>()

const { t } = useI18n()

const label = computed(() => t(`community_poi.status.${props.status}`))

// Each status on a role container, so the label keeps its contrast over the
// card's thumbnail in both schemes. Paused is neutral rather than coloured.
const COLOR_BY_STATUS: Record<CommunityPoiStatus, ChipLabelColor> = {
  'in-progress': 'brand-orange',
  'planning': 'secondary',
  'paused': 'neutral',
  'completed': 'primary',
}

const color = computed<ChipLabelColor>(() => COLOR_BY_STATUS[props.status] ?? 'neutral')
</script>

<template>
  <M3Chip kind="label" :color="color" :label="label" />
</template>
