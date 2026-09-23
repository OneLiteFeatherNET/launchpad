<script setup lang="ts">
import type { EventResults } from '../types'

/**
 * What came out of an event: a one-line verdict, the placements in order,
 * key figures and what happens next. Shown by the page only once the event is
 * past; without results it says they are still to come rather than leaving a
 * gap where readers expect them.
 */
const props = defineProps<{
  results?: EventResults
}>()

const { t } = useI18n()

const placements = computed(() => [...(props.results?.placements ?? [])]
  .sort((a, b) => a.place - b.place))
const stats = computed(() => props.results?.stats ?? [])
const outcome = computed(() => props.results?.outcome ?? [])
const hasResults = computed(() => {
  const lists = placements.value.length + stats.value.length + outcome.value.length
  return Boolean(props.results?.summary) || lists > 0
})
</script>

<template>
  <section aria-labelledby="event-results" class="space-y-5 rounded-large bg-surface-container p-6">
    <h2 id="event-results" class="text-title-large text-on-surface">
      {{ t('events.results.title') }}
    </h2>

    <p v-if="!hasResults" class="text-body-large text-on-surface-variant">
      {{ t('events.results.pending') }}
    </p>

    <template v-else>
      <p v-if="results?.summary" class="text-body-large text-on-surface">{{ results.summary }}</p>

      <ol v-if="placements.length" class="grid gap-3 sm:grid-cols-3">
        <li
          v-for="placement in placements"
          :key="`${placement.place}-${placement.name}`"
          class="overflow-hidden rounded-medium bg-surface-container-low"
        >
          <NuxtPicture
            v-if="placement.image"
            class="block"
            :src="placement.image"
            :alt="placement.imageAlt ?? ''"
            width="480"
            height="270"
            fit="cover"
            loading="lazy"
            format="avif,webp"
            :img-attrs="{ class: 'aspect-video w-full object-cover' }"
          />
          <div class="p-3">
            <p class="text-label-large text-primary">
              {{ t('events.results.place', { place: placement.place }) }}
            </p>
            <p class="text-title-small text-on-surface">{{ placement.name }}</p>
            <p v-if="placement.mcName" class="text-body-small text-on-surface-variant">
              {{ placement.mcName }}
            </p>
          </div>
        </li>
      </ol>

      <dl v-if="stats.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-medium bg-surface-container-low p-3"
        >
          <dt class="text-label-medium text-on-surface-variant">{{ stat.label }}</dt>
          <dd class="text-headline-small text-on-surface">{{ stat.value }}</dd>
        </div>
      </dl>

      <div v-if="outcome.length">
        <h3 class="text-title-medium text-on-surface">{{ t('events.results.outcome') }}</h3>
        <ul class="mt-2 list-disc space-y-1 ps-5 text-body-medium text-on-surface-variant">
          <li v-for="item in outcome" :key="item">{{ item }}</li>
        </ul>
      </div>
    </template>
  </section>
</template>
