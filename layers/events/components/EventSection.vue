<script setup lang="ts">
import type { EventCardData } from '../utils/eventLists'

/**
 * A titled group of event cards. Without events it shows the empty state
 * when one is given, and disappears entirely otherwise — the spec drops
 * "upcoming" and "past" when they are empty but keeps "current" with a hint.
 */
const props = withDefaults(defineProps<{
  id: string
  title: string
  events: EventCardData[]
  emptyText?: string
  emptyActionLabel?: string
  emptyActionHref?: string
}>(), {
  emptyText: undefined,
  emptyActionLabel: undefined,
  emptyActionHref: undefined,
})
</script>

<template>
  <section
    v-if="props.events.length || props.emptyText"
    :aria-labelledby="props.id"
    class="space-y-4"
  >
    <SectionHeading :id="props.id" :level="2" :anchor="false">{{ props.title }}</SectionHeading>
    <ul v-if="props.events.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <EventCard v-for="card in props.events" :key="card.slug" :card="card" />
    </ul>
    <EmptyState
      v-else-if="props.emptyText"
      :text="props.emptyText"
      :icon="['fas', 'circle-info']"
      :action-label="props.emptyActionLabel"
      :action-href="props.emptyActionHref"
    />
  </section>
</template>
