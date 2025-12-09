<script setup lang="ts">
import { computed, useI18n } from '#imports'
import SectionHeading from '~/components/base/typography/SectionHeading.vue'

type Props = {
  title?: string
  subtitle?: string
  totalRaised: number
  goal?: number
  contributors?: number
  currency?: string
  link?: string
  updatedAt?: string | Date
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  goal: undefined,
  contributors: undefined,
  currency: 'EUR',
  link: 'https://opencollective.com/onelitefeather',
  updatedAt: undefined,
  totalRaised: 0
})

const { t, locale } = useI18n()

const headingId = 'collective-title'
const descriptionId = 'collective-subtitle'

const displayTitle = computed(() => props.title ?? t('collective.title'))
const displaySubtitle = computed(() => props.subtitle ?? t('collective.subtitle'))

const formattedRaised = computed(() => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: props.currency || 'EUR',
    maximumFractionDigits: 0
  }).format(props.totalRaised)
})

const formattedGoal = computed(() => {
  if (!props.goal) return null
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: props.currency || 'EUR',
    maximumFractionDigits: 0
  }).format(props.goal)
})

const progress = computed(() => {
  if (!props.goal || props.goal <= 0) return null
  return Math.min(100, Math.round((props.totalRaised / props.goal) * 100))
})

const progressLabel = computed(() => {
  if (!props.goal || !formattedGoal.value) return formattedRaised.value
  return t('collective.progress_label', { raised: formattedRaised.value, goal: formattedGoal.value })
})

const updatedLabel = computed(() => {
  if (!props.updatedAt) return ''
  const date = typeof props.updatedAt === 'string' ? new Date(props.updatedAt) : props.updatedAt
  if (Number.isNaN(date.getTime())) return ''
  return t('collective.updated', { date: date.toLocaleDateString(locale.value) })
})
</script>

<template>
  <section
    id="opencollective"
    class="relative isolate w-full"
    role="region"
    :aria-labelledby="headingId"
    :aria-describedby="descriptionId"
    :aria-label="t('collective.section_aria')"
  >
    <div class="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
      <div class="mb-6 sm:mb-8 text-center">
        <SectionHeading :level="2" :id="headingId" :description-id="descriptionId">
          {{ displayTitle }}
          <template #description>
            {{ displaySubtitle }}
          </template>
        </SectionHeading>
      </div>

      <div class="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
        <div class="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-5 sm:p-6 shadow-sm ring-1 ring-zinc-200/70 dark:ring-zinc-800/70">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ t('collective.raised') }}</p>
          <p class="mt-1 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{{ formattedRaised }}</p>
          <p v-if="formattedGoal" class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('collective.of_goal', { goal: formattedGoal }) }}
          </p>
          <div v-if="progress !== null" class="mt-4" role="img" :aria-label="progressLabel">
            <div class="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-brand-500 transition-all"
                :style="{ width: `${progress}%` }"
              />
            </div>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {{ progressLabel }}
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 p-5 sm:p-6 shadow-sm ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 flex flex-col justify-between">
          <div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ t('collective.contributors') }}</p>
            <p class="mt-1 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ props.contributors ?? '—' }}
            </p>
          </div>
          <p v-if="updatedLabel" class="text-xs text-neutral-500 dark:text-neutral-500 mt-4">
            {{ updatedLabel }}
          </p>
        </div>

        <a
          :href="props.link"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-2xl border border-brand-100/70 dark:border-brand-900/60 bg-brand-50/90 dark:bg-brand-900/30 p-5 sm:p-6 shadow-sm ring-1 ring-brand-100/80 dark:ring-brand-900/60 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 flex flex-col justify-between"
          :aria-label="t('collective.cta')"
        >
          <p class="text-sm font-semibold text-brand-700 dark:text-brand-200">
            OpenCollective
          </p>
          <p class="mt-2 text-lg font-bold text-brand-900 dark:text-brand-100">
            {{ t('collective.cta') }}
          </p>
          <p class="mt-2 text-sm text-brand-800 dark:text-brand-100/80">
            {{ t('collective.subtitle') }}
          </p>
          <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-200">
            {{ t('collective.cta') }}
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
