<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { IconName } from '../types'
import { M3_TAB_BASE, M3_TAB_STATES, M3_TABS_LIST } from '../utils/m3Variants'
import IconFa from './IconFa.vue'

/**
 * MD3 secondary tabs following the ARIA tabs pattern: one `tablist`, a
 * `tab` per entry that points at its panel through `aria-controls`, only the
 * selected tab in the tab order (roving tabindex), and arrow keys, Home and
 * End moving selection and focus together.
 *
 * Renders only the tab row; the caller renders the panels with the ids from
 * `panelId(index)`, so any content can sit behind a tab.
 */
export interface M3TabItem {
  label: string
  icon?: IconName
}

const props = defineProps<{
  tabs: M3TabItem[]
  /** Accessible name of the tab list. */
  label: string
  /** Prefix for tab and panel ids; must be unique on the page. */
  idPrefix: string
}>()

const selected = defineModel<number>({ default: 0 })
const buttons = ref<HTMLButtonElement[]>([])

const tabId = (index: number) => `${props.idPrefix}-tab-${index}`

const select = (index: number) => {
  const count = props.tabs.length
  if (!count) return
  const next = (index + count) % count
  selected.value = next
  nextTick(() => buttons.value[next]?.focus())
}

const onKey = (event: KeyboardEvent) => {
  const moves: Record<string, () => number> = {
    ArrowRight: () => selected.value + 1,
    ArrowLeft: () => selected.value - 1,
    Home: () => 0,
    End: () => props.tabs.length - 1,
  }
  const move = moves[event.key]
  if (!move) return
  event.preventDefault()
  select(move())
}
</script>

<template>
  <div role="tablist" :aria-label="label" :class="M3_TABS_LIST">
    <button
      v-for="(tab, index) in props.tabs"
      :id="tabId(index)"
      :key="tab.label"
      ref="buttons"
      type="button"
      role="tab"
      :aria-selected="index === selected ? 'true' : 'false'"
      :aria-controls="`${props.idPrefix}-panel-${index}`"
      :tabindex="index === selected ? 0 : -1"
      :class="[M3_TAB_BASE, index === selected ? M3_TAB_STATES.selected : M3_TAB_STATES.unselected]"
      @click="select(index)"
      @keydown="onKey"
    >
      <IconFa v-if="tab.icon" :icon="tab.icon" class="size-4" aria-hidden="true" />
      {{ tab.label }}
    </button>
  </div>
</template>
