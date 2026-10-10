<script setup lang="ts">
import type { EventCardData } from '../utils/eventLists'

defineProps<{
  title: string
  events: EventCardData[]
}>()
</script>

<template>
  <section>
    <h2 class="text-title-large font-bold text-on-surface">{{ title }}</h2>
    <ul class="mt-3 space-y-3">
      <li v-for="event in events" :key="event.slug">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <NuxtLink
            :to="event.path"
            class="text-body-large text-primary hover:underline focus-ring"
          >
            {{ event.title }}
          </NuxtLink>
          <EventPhaseChip v-if="event.phase !== 'hidden'" :phase="event.phase" />
        </div>
        <p class="text-body-small text-on-surface-variant">
          <DateRange :start="event.startsAt" :end="event.endsAt" />
        </p>
      </li>
    </ul>
  </section>
</template>
