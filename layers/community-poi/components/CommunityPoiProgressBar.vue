<script setup lang="ts">
import { computed } from '#imports'

const props = withDefaults(defineProps<{
  value: number
  label?: string
  size?: 'sm' | 'md'
}>(), {
  label: '',
  size: 'md'
})

const { t } = useI18n()

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
const visibleLabel = computed(() => props.label || t('community_poi.progress.label'))
const valueText = computed(() => t('community_poi.progress.value_text', { value: clamped.value }))

const heightClass = computed(() => props.size === 'sm' ? 'h-1.5' : 'h-2.5')

const barClass = [
  'h-full rounded-full transition-[width] duration-500',
  'bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]',
  'motion-reduce:transition-none'
].join(' ')
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3 text-sm">
      <span class="text-neutral-700 dark:text-neutral-300">{{ visibleLabel }}</span>
      <span class="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
        {{ clamped }}%
      </span>
    </div>
    <div
      role="progressbar"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuetext="valueText"
      :aria-label="visibleLabel"
      class="mt-1 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800"
      :class="heightClass"
    >
      <div :class="barClass" :style="{ width: clamped + '%' }" />
    </div>
  </div>
</template>
