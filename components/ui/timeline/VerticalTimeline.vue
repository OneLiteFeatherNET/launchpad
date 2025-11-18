<script setup lang="ts">
import { computed } from '#imports'
import VerticalTimelineItem from './VerticalTimelineItem.vue'
import type { TimelineColorVariant, TimelineEvent, TimelineSide } from '~/types/timeline'

const props = withDefaults(defineProps<{
  events: TimelineEvent[]
  // Alternierendes Layout links/rechts ab md
  alternate?: boolean
  // Farbe der Linie
  lineColor?: TimelineColorVariant
  // Aktuelles Event hervorheben
  currentId?: string | number
  ariaLabel?: string
}>(), {
  alternate: true,
  lineColor: 'neutral',
  ariaLabel: 'Zeitachse'
})

const lineColorClass = computed(() => {
  switch (props.lineColor) {
    case 'brand': return '[--line:var(--color-brand-primary)]'
    case 'accent': return '[--line:var(--color-brand-accent)]'
    case 'orange': return '[--line:var(--color-brand-orange)]'
    case 'purple': return '[--line:var(--color-brand-purple)]'
    case 'neutral':
    default: return '[--line:var(--color-border)]'
  }
})

const getSide = (ev: TimelineEvent, index: number): TimelineSide => {
  if (ev.side) return ev.side
  if (!props.alternate) return 'left'
  return index % 2 === 0 ? 'left' : 'right'
}

const isCurrent = (ev: TimelineEvent) => props.currentId != null && String(props.currentId) === String(ev.id)
</script>

<template>
  <section class="relative" :class="lineColorClass">
    <!-- Zentrale Linie (nur ab md) -->
    <div class="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--line)] md:block" aria-hidden="true" />

    <ol role="list" :aria-label="ariaLabel" class="relative mx-auto max-w-5xl space-y-10">
      <slot
        v-for="(ev, i) in events"
        :key="ev.id"
        name="item"
        :event="ev"
        :index="i"
        :side="getSide(ev, i)"
        :is-current="isCurrent(ev)"
      >
        <VerticalTimelineItem
          :event="ev"
          :index="i"
          :position="getSide(ev, i)"
          :current="isCurrent(ev)"
          :color-variant="ev.colorVariant || 'brand'"
        />
      </slot>
    </ol>
  </section>
  
</template>

<style scoped>
</style>
