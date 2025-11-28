<script setup lang="ts">
import { computed, ref, useI18n, watch } from '#imports'
import VerticalTimelineItem from './VerticalTimelineItem.vue'
import type { TimelineColorVariant, TimelineEvent, TimelineSide } from '~/types/timeline'

const props = withDefaults(defineProps<{
  events: TimelineEvent[]
  // Alternate layout left/right from md breakpoint upwards
  alternate?: boolean
  // Color of the central line
  lineColor?: TimelineColorVariant
  // Highlight the current event
  currentId?: string | number
  ariaLabel?: string
  // Display mode: preview (first 4 items) or full
  mode?: 'preview' | 'complete'
  // Optionally blur the last visible item in preview mode when the “Show all” button is visible
  previewBlur?: boolean
}>(), {
  alternate: true,
  lineColor: 'neutral',
  // No fixed default label – i18n fallback is computed below
  ariaLabel: undefined,
  mode: 'complete',
  previewBlur: true,
})

const { t, te } = useI18n()

// a11y/i18n: aria-label prefers i18n, but can be overridden via prop
const ariaLabelComputed = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  // Fallback if key is missing: English default
  return te && te('timeline.aria_label') ? t('timeline.aria_label') : 'Timeline'
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

// Preview logic: load more items via button
const expanded = ref(false)
const PREVIEW_COUNT = 4
const isPreview = computed(() => props.mode === 'preview')
const hasMore = computed(() => isPreview.value && !expanded.value && props.events.length > PREVIEW_COUNT)
const displayedEvents = computed(() => {
  if (!isPreview.value) return props.events
  return expanded.value ? props.events : props.events.slice(0, PREVIEW_COUNT)
})
const expandAll = () => { expanded.value = true }

// Reset preview state when mode or number of events changes (e.g. when locale changes)
watch(
  () => [props.mode, props.events?.length],
  () => { if (isPreview.value) expanded.value = false },
)

const getSide = (ev: TimelineEvent, index: number): TimelineSide => {
  if (ev.side) return ev.side
  if (!props.alternate) return 'left'
  return index % 2 === 0 ? 'left' : 'right'
}

const isCurrent = (ev: TimelineEvent) => props.currentId != null && String(props.currentId) === String(ev.id)

// Show a bottom glow even without the “Show all” button: in full mode or after expanding the preview
const shouldShowBottomGlow = computed(() => {
  if (!props?.events?.length) return false
  // When the “Show all” button is visible, its wrapper handles the glow
  if (hasMore.value) return false
  if (props.mode === 'complete') return true
  return isPreview.value && expanded.value
})

// Show “birth” marker only when the full timeline is visible
const showBirthLabels = computed(() => {
  if (!props?.events?.length) return false
  if (props.mode === 'complete') return true
  return isPreview.value && expanded.value
})

// Blur logic for the last visible entry in preview mode
const shouldBlur = (index: number) => {
  if (!props.previewBlur) return false
  return hasMore.value && index === PREVIEW_COUNT - 1
}
</script>

<template>
  <section class="relative" :class="lineColorClass">
    <!-- Central line (visible from md breakpoint upwards) -->

    <ol role="list" :aria-label="ariaLabelComputed" class="relative mx-auto max-w-5xl space-y-10">
      <div class="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--line)] md:block" aria-hidden="true" />
      <template v-for="(ev, i) in displayedEvents" :key="ev.id">
        <slot
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
            :show-birth="showBirthLabels && !!ev.isBirth"
            :blurred="shouldBlur(i)"
          />
        </slot>

        <!-- “Show all” button with preview blur styling below the 4th entry -->
        <li v-if="hasMore && i === PREVIEW_COUNT - 1" class="list-none mx-auto -mt-2 flex justify-center">
          <slot name="load-more" :expand-all="expandAll" :remaining="props.events.length - PREVIEW_COUNT">
            <div class="relative isolate">
              <!-- Decorative glow layers -->
              <span aria-hidden="true" class="pointer-events-none absolute z-0 left-1/2 top-full h-8 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[999px] blur-2xl opacity-40 bg-[radial-gradient(60%_100%_at_50%_50%,var(--color-brand-primary)_0%,transparent_70%)]"></span>
              <span aria-hidden="true" class="pointer-events-none absolute z-0 left-1/2 top-full h-6 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[999px] blur-2xl opacity-35 bg-[radial-gradient(60%_100%_at_50%_50%,var(--color-brand-accent)_0%,transparent_70%)]"></span>

              <button
                type="button"
                class="relative z-10 inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 no-underline shadow-sm hover:bg-white dark:hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]"
                :aria-label="t('timeline.show_all_aria')"
                :aria-expanded="expanded"
                @click="expandAll"
              >
                {{ t('timeline.show_all') }}
              </button>
            </div>
          </slot>
        </li>
      </template>
    </ol>

    <!-- Bottom glow even without button (full view or expanded preview) -->
    <div v-if="shouldShowBottomGlow" class="mx-auto mt-6 flex max-w-5xl justify-center">
      <div class="relative isolate h-8 w-40">
        <span aria-hidden="true" class="pointer-events-none absolute z-0 inset-0 rounded-[999px] blur-2xl opacity-40 bg-[radial-gradient(60%_100%_at_50%_50%,var(--color-brand-primary)_0%,transparent_70%)]"></span>
        <span aria-hidden="true" class="pointer-events-none absolute z-0 left-1/2 top-1/2 h-6 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[999px] blur-2xl opacity-35 bg-[radial-gradient(60%_100%_at_50%_50%,var(--color-brand-accent)_0%,transparent_70%)]"></span>
      </div>
    </div>
  </section>
  
</template>

<style scoped>
</style>
