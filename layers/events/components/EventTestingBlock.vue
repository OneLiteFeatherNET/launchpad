<script setup lang="ts">
import type { EventPhase, EventTesting } from '../types'

/**
 * For betas: what the test looks at, what is already known to be broken and
 * where to send feedback. The feedback action goes once the test is over;
 * focus and known issues stay readable as a record of the test.
 */
const props = defineProps<{
  testing?: EventTesting
  phase: Exclude<EventPhase, 'hidden'>
}>()

const { t } = useI18n()

const focus = computed(() => props.testing?.focus ?? [])
const issues = computed(() => props.testing?.knownIssues ?? [])
const feedbackUrl = computed(() => (
  props.phase === 'past' ? undefined : props.testing?.feedbackUrl
))
</script>

<template>
  <section
    v-if="focus.length || issues.length || feedbackUrl"
    aria-labelledby="event-testing"
    class="space-y-4 rounded-large bg-surface-container-low p-6"
  >
    <h2 id="event-testing" class="text-title-large text-on-surface">
      {{ t('events.testing.title') }}
    </h2>
    <div v-if="focus.length">
      <h3 class="text-title-small text-on-surface">{{ t('events.testing.focus') }}</h3>
      <ul class="mt-1 list-disc ps-5 text-body-medium text-on-surface-variant">
        <li v-for="item in focus" :key="item">{{ item }}</li>
      </ul>
    </div>
    <div v-if="issues.length">
      <h3 class="text-title-small text-on-surface">{{ t('events.testing.known_issues') }}</h3>
      <ul class="mt-1 list-disc ps-5 text-body-medium text-on-surface-variant">
        <li v-for="item in issues" :key="item">{{ item }}</li>
      </ul>
    </div>
    <M3Button
      v-if="feedbackUrl"
      variant="tonal"
      :icon="['fas', 'comment']"
      :href="feedbackUrl"
      target="_blank"
    >
      {{ t('events.testing.feedback') }}
      <span class="sr-only">{{ t('resources.opens_new_tab') }}</span>
    </M3Button>
  </section>
</template>
