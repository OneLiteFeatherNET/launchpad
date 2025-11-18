<script setup lang="ts">
import { computed, useI18n } from '#imports'
import type { TimelineColorVariant, TimelineEvent, TimelineSide } from '~/types/timeline'

const props = withDefaults(defineProps<{
  event: TimelineEvent
  index?: number
  // Force the item position (otherwise alternates via parent)
  position?: TimelineSide
  // Color scheme for the dot marker
  colorVariant?: TimelineColorVariant
  // Marks the current/active event
  current?: boolean
}>(), {
  colorVariant: 'brand',
  current: false,
})

const emit = defineEmits<{
  (e: 'select', event: TimelineEvent): void
}>()

const colorClass = computed(() => {
  switch (props.colorVariant || props.event.colorVariant) {
    case 'accent':
      return '[--dot:var(--color-brand-accent)]'
    case 'orange':
      return '[--dot:var(--color-brand-orange)]'
    case 'purple':
      return '[--dot:var(--color-brand-purple)]'
    case 'neutral':
      return '[--dot:var(--color-border)]'
    case 'brand':
    default:
      return '[--dot:var(--color-brand-primary)]'
  }
})

const side = computed<TimelineSide>(() => props.position || props.event.side || 'left')

const { locale } = useI18n()

const formattedDate = computed(() => {
  const d = typeof props.event.date === 'string' ? new Date(props.event.date) : props.event.date
  // Fallback: if invalid date, return raw value (e.g. ISO string)
  if (isNaN(d.getTime())) return String(props.event.date)
  // Use current i18n locale for date formatting
  const loc = (locale?.value || 'de-DE') as Intl.LocalesArgument
  return new Intl.DateTimeFormat(loc, { dateStyle: 'medium' }).format(d)
})

const onClick = () => emit('select', props.event)
</script>

<template>
  <li class="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12" :class="colorClass" :aria-current="current ? 'step' : undefined">
    <!-- Left column (for alternating layout)
         Note: The left wrapper is always order-1 and the right is order-2.
         Content renders on the left when side='left' (in the wrapper below),
         and on the right when side='right' (in this wrapper). -->
    <div class="md:min-h-[4rem] md:order-1">
      <div v-if="side === 'left'" class="md:max-w-prose md:ml-auto">
        <header class="flex items-start gap-3 md:flex-row-reverse">
          <div class="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--dot)] ring-4 ring-[var(--color-surface)] dark:ring-neutral-900" />
          <div class="md:text-right">
            <div class="text-sm text-[var(--color-muted)]"> <slot name="date">{{ formattedDate }}</slot> </div>
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">
              <slot name="title">{{ event.title }}</slot>
            </h3>
          </div>
        </header>
        <div class="mt-2 text-neutral-700 dark:text-neutral-300 md:text-right">
          <slot>
            <p v-if="event.description">{{ event.description }}</p>
          </slot>
        </div>
        <div class="mt-3 md:flex md:justify-end">
          <NuxtLink v-if="event.href" :to="event.href" class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm no-underline hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dot)]" @click="onClick">
            Mehr
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Right column -->
    <div class="md:min-h-[4rem] md:order-2">
      <div v-if="side === 'right'" class="md:max-w-prose">
        <header class="flex items-start gap-3">
          <div class="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--dot)] ring-4 ring-[var(--color-surface)] dark:ring-neutral-900" />
          <div>
            <div class="text-sm text-[var(--color-muted)]"> <slot name="date">{{ formattedDate }}</slot> </div>
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">
              <slot name="title">{{ event.title }}</slot>
            </h3>
          </div>
        </header>
        <div class="mt-2 text-neutral-700 dark:text-neutral-300">
          <slot>
            <p v-if="event.description">{{ event.description }}</p>
          </slot>
        </div>
        <div class="mt-3">
          <NuxtLink v-if="event.href" :to="event.href" class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm no-underline hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dot)]" @click="onClick">
            Mehr
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- The center line is rendered by the parent component -->
  </li>
</template>

<style scoped>
</style>
