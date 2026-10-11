<script setup lang="ts">
import { computed } from '#imports'
import type { ChipLabelColor } from '#layers/base'
import type { ProjectAudience } from '../types'

const props = defineProps<{
  audience: ProjectAudience
}>()

const { t } = useI18n()

const label = computed(() => t(`projects.audience.label.${props.audience}`))

// Internal stays outlined (no fill) so the two audiences differ in more than hue.
const COLOR_BY_AUDIENCE: Record<ProjectAudience, ChipLabelColor | undefined> = {
  external: 'tertiary',
  internal: undefined,
}

const color = computed(() => COLOR_BY_AUDIENCE[props.audience])
</script>

<template>
  <M3Chip kind="label" :color="color" :label="label" />
</template>
