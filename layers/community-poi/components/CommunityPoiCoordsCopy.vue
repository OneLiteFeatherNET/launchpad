<script setup lang="ts">
import { ref, computed } from '#imports'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  x: number
  y?: number
  z: number
}>()

const { t } = useI18n()
const { copy, isSupported } = useClipboard({ legacy: true })

const recentlyCopied = ref<'raw' | 'tp' | null>(null)
let resetTimer: ReturnType<typeof setTimeout> | null = null

// Most mod placement fields (Litematica, WorldEdit, etc.) accept whitespace-
// separated numbers — the `/tp @s …` variant is what players paste straight
// into chat.
const rawValue = computed(() => {
  const parts = props.y !== undefined
    ? [props.x,
props.y,
props.z]
    : [props.x, props.z]
  return parts.join(' ')
})

const tpValue = computed(() => {
  const y = props.y ?? '~'
  return `/tp @s ${props.x} ${y} ${props.z}`
})

const handleCopy = async (kind: 'raw' | 'tp', value: string) => {
  if (!isSupported.value) return
  try {
    await copy(value)
    recentlyCopied.value = kind
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      recentlyCopied.value = null
    }, 1800)
  } catch {
    // Silent failure: clipboard is non-critical, the value is still visible.
  }
}

const rawIcon = computed<[string, string]>(() => ['fas', recentlyCopied.value === 'raw' ? 'check' : 'copy'])
const rawLabel = computed(() => t(recentlyCopied.value === 'raw' ? 'community_poi.copy.copied' : 'community_poi.copy.raw'))
const tpLabel = computed(() => t(recentlyCopied.value === 'tp' ? 'community_poi.copy.copied' : 'community_poi.copy.tp'))
const tpIcon = computed<[string, string]>(() => ['fas', recentlyCopied.value === 'tp' ? 'check' : 'terminal'])
</script>

<template>
  <!-- Copy actions: MD3 assist chips, the leading icon flipping to a check once copied. -->
  <div class="inline-flex flex-wrap items-center gap-2">
    <M3Chip
      kind="assist"
      :icon="rawIcon"
      :label="rawLabel"
      :aria-label="t('community_poi.copy.raw_aria', { value: rawValue })"
      :title="rawValue"
      @click="handleCopy('raw', rawValue)"
    />
    <M3Chip
      kind="assist"
      :icon="tpIcon"
      :label="tpLabel"
      :aria-label="t('community_poi.copy.tp_aria', { value: tpValue })"
      :title="tpValue"
      @click="handleCopy('tp', tpValue)"
    />
  </div>
</template>
