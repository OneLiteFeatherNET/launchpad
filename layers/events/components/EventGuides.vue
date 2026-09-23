<script setup lang="ts">
import type { VNode } from 'vue'
import { computed, Fragment, onMounted, provide, ref, useId, useSlots } from 'vue'
import { GUIDE_TABS_KEY, guideIcon } from '../utils/guideIcons'

/**
 * Groups the `event-guide` blocks of an event's markdown:
 *
 *     ::event-guides
 *     :::event-guide{role="Survivor"} … :::
 *     :::event-guide{role="Slender"} … :::
 *     ::
 *
 * The server — and the first client render, so hydration matches — shows
 * every guide one below the other, each with its heading: readable without
 * JavaScript, and nothing hidden from a crawler. After mounting, two or more
 * guides become MD3 tabs, one panel per role.
 */
const slots = useSlots()
const { t } = useI18n()
const id = useId()

const enhanced = ref(false)
const selected = ref(0)
onMounted(() => { enhanced.value = true })

/** Slot children flattened out of fragments, keeping only guide blocks. */
function guideNodes(nodes: VNode[] = []): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      return guideNodes(node.children as VNode[])
    }
    return node.props && 'role' in node.props ? [node] : []
  })
}

const guides = computed(() => guideNodes(slots.default?.()))
const tabs = computed(() => guides.value.map((node) => ({
  label: String(node.props?.role ?? ''),
  icon: guideIcon(node.props?.icon as string | undefined),
})))
const asTabs = computed(() => enhanced.value && guides.value.length > 1)

provide(GUIDE_TABS_KEY, asTabs)
</script>

<template>
  <section :aria-label="t('events.guides.title')" class="not-prose my-6 space-y-4">
    <M3Tabs
      v-if="asTabs"
      v-model="selected"
      :tabs="tabs"
      :label="t('events.guides.title')"
      :id-prefix="id"
    />
    <div
      v-for="(node, index) in guides"
      :id="`${id}-panel-${index}`"
      :key="index"
      :role="asTabs ? 'tabpanel' : undefined"
      :aria-labelledby="asTabs ? `${id}-tab-${index}` : undefined"
      :tabindex="asTabs ? 0 : undefined"
      :hidden="asTabs && index !== selected"
      class="focus-ring rounded-medium"
    >
      <component :is="node" />
    </div>
  </section>
</template>
