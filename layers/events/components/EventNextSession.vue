<script setup lang="ts">
import type { EventSessionSlot, EventSessions } from '../types'
import { countdownParts, nextSessionAt } from '../utils/eventSessions'

/**
 * The event's next recurring session. Server render and hydration show only
 * `initial` — the slot the server picked — as an absolute time. Once mounted,
 * the browser's clock re-derives the slot from the rule (a page from the edge
 * cache may be an hour old) and adds the countdown or "happening now"; those
 * are updates after hydration, not a different first render (design.md D3).
 */
const props = defineProps<{
  sessions: EventSessions
  until?: string
  initial: EventSessionSlot
}>()

const { t } = useI18n()
const now = useClientNow()

const slot = computed(() => (now.value === null
  ? props.initial
  : nextSessionAt(props.sessions, props.until, now.value)))
const startsAt = computed(() => slot.value?.startsAt)
const endsAt = computed(() => slot.value?.endsAt)

const live = computed(() => now.value !== null && startsAt.value !== undefined
  && Date.parse(startsAt.value) <= now.value)

const countdown = computed(() => {
  if (now.value === null || startsAt.value === undefined || live.value) return ''
  const { days, hours, minutes } = countdownParts(Date.parse(startsAt.value) - now.value)
  const unit = (key: 'days' | 'hours' | 'minutes', n: number) => t(`events.sessions.unit.${key}`, { n }, n)
  const time = days > 0
    ? [unit('days', days), unit('hours', hours)]
    : hours > 0
      ? [unit('hours', hours), unit('minutes', minutes)]
      : [unit('minutes', minutes)]
  return t('events.sessions.starts_in', { time: time.join(', ') })
})
</script>

<template>
  <section
    v-if="startsAt && endsAt"
    aria-labelledby="event-session"
    class="space-y-3 rounded-large bg-secondary-container p-6 text-on-secondary-container"
  >
    <h2 id="event-session" class="text-title-large">{{ sessions.label }}</h2>
    <p class="text-title-medium"><DateRange :start="startsAt" :end="endsAt" /></p>
    <p v-if="sessions.repeat === 'weekly'" class="text-body-medium">
      {{ t('events.sessions.weekly') }}
    </p>
    <!-- Always present so the countdown appearing after mount moves nothing. -->
    <div class="min-h-8">
      <M3Chip v-if="live" kind="label" color="primary" :label="t('events.sessions.live')" />
      <p v-else-if="countdown" role="timer" class="text-headline-small tabular-nums">
        {{ countdown }}
      </p>
    </div>
  </section>
</template>
