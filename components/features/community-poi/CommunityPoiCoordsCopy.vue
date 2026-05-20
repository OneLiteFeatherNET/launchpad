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
  const parts = props.y !== undefined ? [props.x,
props.y,
props.z] : [props.x, props.z]
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

const buttonBase = [
  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs',
  'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]',
  'transition hover:bg-[color-mix(in_oklab,var(--color-brand-secondary)_10%,transparent)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]'
].join(' ')
</script>

<template>
  <div class="inline-flex flex-wrap items-center gap-2">
    <button
      type="button"
      :class="buttonBase"
      :aria-label="t('community_poi.copy.raw_aria', { value: rawValue })"
      :title="rawValue"
      @click="handleCopy('raw', rawValue)"
    >
      <span aria-hidden="true">{{ recentlyCopied === 'raw' ? '✓' : '📋' }}</span>
      <span>{{
        recentlyCopied === 'raw'
          ? t('community_poi.copy.copied')
          : t('community_poi.copy.raw')
      }}</span>
    </button>
    <button
      type="button"
      :class="buttonBase"
      :aria-label="t('community_poi.copy.tp_aria', { value: tpValue })"
      :title="tpValue"
      @click="handleCopy('tp', tpValue)"
    >
      <span aria-hidden="true">{{ recentlyCopied === 'tp' ? '✓' : '⌘' }}</span>
      <span>{{
        recentlyCopied === 'tp'
          ? t('community_poi.copy.copied')
          : t('community_poi.copy.tp')
      }}</span>
    </button>
  </div>
</template>
