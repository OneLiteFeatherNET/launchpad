<script setup lang="ts">
import { computed } from '#imports'
import type { ChipLabelColor } from '#layers/base'
import type { ProjectStatus } from '../types'

const props = defineProps<{
  status: ProjectStatus
}>()

const { t } = useI18n()

const label = computed(() => t(`projects.status.${props.status}`))

const COLOR_BY_STATUS: Record<ProjectStatus, ChipLabelColor> = {
  active: 'primary',
  maintenance: 'secondary',
  archived: 'neutral',
}

const color = computed<ChipLabelColor>(() => COLOR_BY_STATUS[props.status] ?? 'neutral')
</script>

<template>
  <M3Chip kind="label" :color="color" :label="label" />
</template>
