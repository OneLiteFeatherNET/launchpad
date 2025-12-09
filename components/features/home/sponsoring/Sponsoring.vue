<script setup lang="ts">
import { computed, ref, useI18n } from '#imports'
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

const enhancedSponsors: Sponsor[] = props.sponsors;

const ariaLabelFor = (name: string) => t('sponsor.card_aria', { name })

const current = ref(0)
const next = () => {
  current.value = (current.value + 1) % enhancedSponsors.value.length
}
const prev = () => {
  current.value = (current.value - 1 + enhancedSponsors.value.length) % enhancedSponsors.value.length
}
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
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500/60 via-brand-400/50 to-brand-600/60 p-[1.5px] shadow-[0_15px_40px_-22px_rgba(0,0,0,0.3)]">
          <div class="relative h-full rounded-[1.1rem] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-6 shadow-sm ring-1 ring-zinc-200/70 dark:ring-zinc-800/70">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">{{ t('sponsor.title') }}</p>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-full p-2 text-neutral-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :aria-label="t('carousel.prev') || 'Zurück'"
                @click="prev"
              >
                ‹
              </button>
              <button
                type="button"
                class="rounded-full p-2 text-neutral-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                :aria-label="t('carousel.next') || 'Weiter'"
                @click="next"
              >
                ›
              </button>
            </div>
          </div>

          <div class="relative mt-4 min-h-[200px]">
            <Transition name="fade" mode="out-in">
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
                      <p v-if="enhancedSponsors[current]?.description" class="mt-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {{ enhancedSponsors[current]?.description }}
                      </p>
                    </div>
                    <span
                      v-if="enhancedSponsors[current]?.badge"
                      class="inline-flex shrink-0 items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 px-3 py-1 text-xs font-semibold ring-1 ring-brand-100/60 dark:ring-brand-900/60"
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
              class="h-2.5 w-2.5 rounded-full transition-all transform ring-2 ring-transparent"
              :class="idx === current ? 'bg-brand-500 scale-125 shadow ring-offset-2 ring-brand-200 dark:ring-brand-800' : 'bg-zinc-300 dark:bg-zinc-700 scale-100'"
              :aria-label="ariaLabelFor(s.name)"
              @click="current = idx"
            />
          </div>
          </div>
        </div>

        <a
          :href="'mailto:sponsoring@onelitefeather.net'"
          class="group block h-full rounded-2xl border-2 border-brand-300/80 dark:border-brand-800/80 bg-brand-50/80 dark:bg-brand-900/30 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          :aria-label="ariaLabelFor(t('sponsor.cta_title'))"
        >
          <p class="text-sm font-semibold text-brand-700 dark:text-brand-200">
            {{ t('sponsor.cta_badge') }}
          </p>
          <p class="mt-2 text-xl font-bold text-brand-900 dark:text-brand-100">
            {{ t('sponsor.cta_title') }}
          </p>
          <p class="mt-2 text-sm text-brand-800 dark:text-brand-100/80">
            {{ t('sponsor.cta_description') }}
          </p>
          <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-200">
            {{ t('sponsor.cta_link') }}
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
