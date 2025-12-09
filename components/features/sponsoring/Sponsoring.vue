<script setup lang="ts">
import { computed, ref, useI18n, watch } from '#imports'
import SectionHeading from '~/components/base/typography/SectionHeading.vue'

type Sponsor = {
  name: string
  url: string
  description?: string
  badge?: string
}

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  sponsors: Sponsor[]
}>(), {
  title: undefined,
  subtitle: undefined
})

const { t } = useI18n()

const headingId = 'sponsoring-title'
const descriptionId = 'sponsoring-subtitle'
const sectionAria = computed(() => t('sponsor.section_aria'))

const displayTitle = computed(() => props.title ?? t('sponsor.title'))
const displaySubtitle = computed(() => props.subtitle ?? t('sponsor.subtitle'))

const enhancedSponsors = computed<Sponsor[]>(() => props.sponsors ?? [])

const ariaLabelFor = (name: string) => t('sponsor.card_aria', { name })

const current = ref(0)
const next = () => {
  if (!enhancedSponsors.value.length) return
  current.value = (current.value + 1) % enhancedSponsors.value.length
}
const prev = () => {
  if (!enhancedSponsors.value.length) return
  current.value = (current.value - 1 + enhancedSponsors.value.length) % enhancedSponsors.value.length
}

const onSwipe = (direction: 'left' | 'right') => {
  direction === 'left' ? next() : prev()
}

const startX = ref<number | null>(null)
const handleTouchEnd = (event: TouchEvent) => {
  const endX = event.changedTouches?.[0]?.clientX ?? null
  if (startX.value == null || endX == null) return
  const delta = endX - startX.value
  if (Math.abs(delta) > 30) onSwipe(delta < 0 ? 'left' : 'right')
  startX.value = null
}

watch(
  () => enhancedSponsors.value.length,
  (len) => {
    if (!len) {
      current.value = 0
      return
    }
    if (current.value >= len) {
      current.value = 0
    }
  },
  { immediate: true }
)
</script>

<template>
  <section
    id="sponsoring"
    class="relative isolate w-full"
    role="region"
    :aria-labelledby="headingId"
    :aria-describedby="descriptionId"
    :aria-label="sectionAria"
  >
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="mb-8 text-center">
        <SectionHeading :level="2" :id="headingId" :description-id="descriptionId">
          {{ displayTitle }}
          <template #description>
            {{ displaySubtitle }}
          </template>
        </SectionHeading>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-stretch">
        <div class="relative rounded-2xl border border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/90 shadow-sm">
          <div class="relative h-full rounded-[1.1rem] p-5 sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">{{ t('sponsor.title') }}</p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-full cursor-pointer p-2 text-neutral-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  :aria-label="t('carousel.prev') || 'Zurück'"
                  @click="prev"
                >
                  ‹
                </button>
                <button
                  type="button"
                  class="rounded-full cursor-pointer p-2 text-neutral-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  :aria-label="t('carousel.next') || 'Weiter'"
                  @click="next"
                >
                  ›
                </button>
              </div>
            </div>

            <div
              class="relative mt-4 min-h-[260px] sm:min-h-[220px]"
              @touchstart.passive="startX = $event.changedTouches?.[0]?.clientX ?? null"
              @touchend.passive="handleTouchEnd($event)"
            >
              <Transition
                mode="out-in"
                enter-active-class="transition-opacity duration-200"
                leave-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
              >
                <a
                  :key="enhancedSponsors[current]?.name"
                  :href="enhancedSponsors[current]?.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="absolute inset-0 block h-full"
                  :aria-label="ariaLabelFor(enhancedSponsors[current]?.name || '')"
                >
                  <div class="flex h-full flex-col rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {{ enhancedSponsors[current]?.name }}
                        </p>
                        <p v-if="enhancedSponsors[current]?.description" class="mt-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-4 sm:line-clamp-3">
                          {{ enhancedSponsors[current]?.description }}
                        </p>
                      </div>
                      <span
                        v-if="enhancedSponsors[current]?.badge"
                        class="inline-flex shrink-0 items-center rounded-full bg-[var(--color-surface)] text-brand-700 dark:text-brand-200 px-3 py-1 text-xs font-semibold ring-1 ring-[var(--color-border)]/60"
                      >
                        {{ enhancedSponsors[current]?.badge }}
                      </span>
                    </div>
                    <span class="mt-auto inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
                      {{ t('sponsor.cta_link') }}
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </a>
              </Transition>
            </div>

            <div class="mt-4 flex gap-2 justify-center">
              <button
                v-for="(s, idx) in enhancedSponsors"
                :key="s.name"
                type="button"
                class="relative h-3 w-3 rounded-full transition-all transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent,#38bdf8)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
                :class="idx === current
                  ? 'bg-[var(--color-brand-accent,#38bdf8)] scale-110 ring-2 ring-[var(--color-border)]/10 ring-offset-2 ring-offset-[var(--color-surface)] shadow-[0_0_0_2px_rgba(56,189,248,0.25)]'
                  : 'bg-zinc-300 dark:bg-zinc-700 scale-100 ring-1 ring-[var(--color-border)]/40'"
                :aria-label="ariaLabelFor(s.name)"
                :aria-current="idx === current ? 'true' : undefined"
                @click="current = idx"
              />
            </div>
          </div>
        </div>

        <a
          :href="'mailto:sponsoring@onelitefeather.net'"
          class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-brand-accent,#38bdf8)]/40 bg-[var(--color-brand-accent,#38bdf8)]/10 text-brand-900 dark:text-brand-100 p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          :aria-label="ariaLabelFor(t('sponsor.cta_title'))"
        >
          <span
            class="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-400/30 via-sky-400/25 to-brand-500/30 opacity-70 blur-lg"
            aria-hidden="true"
          />
          <p class="text-sm font-semibold text-brand-800 dark:text-brand-200">
            {{ t('sponsor.cta_badge') }}
          </p>
          <p class="mt-2 text-xl font-bold text-brand-900 dark:text-brand-100">
            {{ t('sponsor.cta_title') }}
          </p>
          <p class="mt-2 text-sm text-brand-800/90 dark:text-brand-100/80">
            {{ t('sponsor.cta_description') }}
          </p>
          <div class="mt-auto pt-6 flex items-end">
            <span class="relative inline-flex items-center gap-2 text-sm font-semibold text-brand-900 dark:text-brand-50 px-3 py-2 rounded-full bg-white/80 dark:bg-white/10 shadow-sm overflow-hidden">
              {{ t('sponsor.cta_link') }}
              <span aria-hidden="true">→</span>
              <span class="absolute -inset-px rounded-full bg-gradient-to-r from-brand-400/70 via-sky-400/60 to-brand-500/70 opacity-40 blur-md" aria-hidden="true" />
              <span class="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-400/60 animate-ping" aria-hidden="true" />
            </span>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
