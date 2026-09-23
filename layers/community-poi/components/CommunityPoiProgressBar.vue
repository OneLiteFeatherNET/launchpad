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
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3 text-body-medium">
      <span class="text-on-surface-variant">{{ visibleLabel }}</span>
      <span class="font-medium tabular-nums text-on-surface">
        {{ clamped }}%
      </span>
    </div>
    <M3LinearProgress
      class="mt-1"
      :value="clamped"
      :label="visibleLabel"
      :value-text="valueText"
      :size="size"
    />
  </div>
</template>
