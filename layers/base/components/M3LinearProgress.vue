<script setup lang="ts">
import { computed } from 'vue'
import {
  M3_LINEAR_PROGRESS_INDICATOR,
  M3_LINEAR_PROGRESS_SIZES,
  M3_LINEAR_PROGRESS_TRACK,
} from '../utils/m3Variants'

/**
 * MD3 determinate linear progress. A bar without a name tells a screen
 * reader nothing, so `label` is required; `valueText` replaces the bare
 * percentage where a sentence reads better ("40 % gebaut").
 */
const props = withDefaults(defineProps<{
  /** Progress in percent; clamped to 0–100 and rounded. */
  value: number
  label: string
  valueText?: string
  size?: 'sm' | 'md'
}>(), {
  valueText: undefined,
  size: 'sm',
})

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
</script>

<template>
  <div
    role="progressbar"
    :aria-label="label"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuetext="valueText"
    :class="[M3_LINEAR_PROGRESS_TRACK, M3_LINEAR_PROGRESS_SIZES[size]]"
  >
    <div :class="M3_LINEAR_PROGRESS_INDICATOR" :style="{ width: `${clamped}%` }" />
  </div>
</template>
