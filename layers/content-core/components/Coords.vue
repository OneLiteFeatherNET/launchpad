<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

/**
 * Coordinates inside running text, written as `:coords{x=1161 y=75 z=339}`
 * (or `::coords{…}` on its own line). The chip copies a teleport command.
 * Without `y` the command uses `~`, which keeps the player's current height.
 */
const props = defineProps<{
  x: number | string
  y?: number | string
  z: number | string
  world?: string
}>()

const { t } = useI18n()
const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

const DIMENSIONS = ['overworld',
'nether',
'end']

const position = computed(() => (props.y === undefined
  ? [props.x, props.z]
  : [props.x,
props.y,
props.z]).join(' / '))
const command = computed(() => `/tp ${props.x} ${props.y ?? '~'} ${props.z}`)
const dimensionLabel = computed(() => (props.world && DIMENSIONS.includes(props.world)
  ? t(`mdc.dimension.${props.world}`)
  : ''))
const icon = computed<[string, string]>(() => ['fas', copied.value ? 'check' : 'copy'])
const label = computed(() => t(copied.value ? 'mdc.coords.copied' : 'mdc.coords.copy'))

async function onCopy() {
  try {
    await navigator.clipboard.writeText(command.value)
    copied.value = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    // Clipboard is optional: the coordinates stay visible either way.
  }
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <span
    class="inline-flex flex-wrap items-center gap-x-2 gap-y-1 align-middle"
    role="group"
    :aria-label="t('mdc.coords.label')"
  >
    <span class="font-mono text-on-surface">{{ position }}</span>
    <span v-if="dimensionLabel" class="text-body-small text-on-surface-variant">
      ({{ dimensionLabel }})
    </span>
    <M3Chip
      kind="assist"
      :icon="icon"
      :label="label"
      :aria-label="t('mdc.coords.copy_aria', { command })"
      :title="command"
      @click="onCopy"
    />
  </span>
</template>
