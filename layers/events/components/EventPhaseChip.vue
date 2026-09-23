<script setup lang="ts">
import type { M3Color } from '#layers/base'
import type { EventPhase } from '../types'

/** Non-interactive status label for an event's phase. */
const props = defineProps<{
  phase: Exclude<EventPhase, 'hidden'>
}>()

const { t } = useI18n()

const COLORS: Record<Exclude<EventPhase, 'hidden'>, M3Color | undefined> = {
  running: 'primary',
  announced: 'tertiary',
  past: undefined,
}
</script>

<template>
  <M3Chip kind="label" :color="COLORS[props.phase]" :label="t(`events.phase.${props.phase}`)" />
</template>
