<script setup lang="ts">
import type { M3Color } from '#layers/base'
import type { EventPhase } from '../types'

/**
 * Non-interactive status label for an event's phase. `hidden` only reaches
 * this component for an unlisted event in preview (design.md D3) and shows
 * as a neutral "Vorschau" / "Preview" label rather than a phase name — the
 * event has not been announced, so naming a phase would overstate it.
 */
const props = defineProps<{
  phase: EventPhase
}>()

const { t } = useI18n()

const COLORS: Record<EventPhase, M3Color | undefined> = {
  hidden: undefined,
  running: 'primary',
  announced: 'tertiary',
  past: undefined,
}
</script>

<template>
  <M3Chip kind="label" :color="COLORS[props.phase]" :label="t(`events.phase.${props.phase}`)" />
</template>
