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

const raisedValue = computed(() => {
  const value = Number(props.totalRaised ?? 0)
  return Number.isFinite(value) ? value : 0
})

const goalValue = computed(() => {
  const value = Number(props.goal ?? 0)
  return Number.isFinite(value) && value > 0 ? value : 0
})

const formattedRaised = computed(() => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: props.currency || 'EUR',
    maximumFractionDigits: 0
  }).format(raisedValue.value)
})

const formattedGoal = computed(() => {
  if (!goalValue.value) return null
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: props.currency || 'EUR',
    maximumFractionDigits: 0
  }).format(goalValue.value)
})

const progress = computed(() => {
  if (!goalValue.value) return 0
  return Math.min(100, Math.max(0, Math.round((raisedValue.value / goalValue.value) * 100)))
})

const progressLabel = computed(() => {
  if (!goalValue.value || !formattedGoal.value) return formattedRaised.value
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
        <div class="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/90 p-5 sm:p-6 shadow-sm">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ t('collective.raised') }}</p>
          <p class="mt-1 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{{ formattedRaised }}</p>
          <p v-if="formattedGoal" class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('collective.of_goal', { goal: formattedGoal }) }}
          </p>
          <div v-if="goalValue" class="mt-4" role="img" :aria-label="progressLabel">
            <div class="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-[var(--color-brand-accent,#38bdf8)] transition-all"
                :style="{ width: `${progress}%` }"
              />
            </div>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {{ progressLabel }}
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
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
          class="group relative overflow-hidden rounded-2xl border border-[var(--color-brand-accent,#38bdf8)]/40 bg-[var(--color-brand-accent,#38bdf8)]/12 text-brand-900 dark:text-brand-100 p-5 sm:p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 flex flex-col justify-between"
          :aria-label="t('collective.cta')"
          data-ph-capture-attribute="cta"
          data-ph-capture-attribute-name="open-collective"
        >
          <span
            class="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-400/30 via-sky-400/25 to-brand-500/30 opacity-80 blur-lg"
            aria-hidden="true"
          />
          <div>
            <p class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-brand-800 shadow-sm dark:bg-white/10">
              {{ t('collective.raised') }}
              <span class="h-2 w-2 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
            </p>
            <p class="mt-3 text-lg font-bold">
              {{ t('collective.cta') }}
            </p>
            <p class="mt-2 text-sm text-brand-800/80 dark:text-brand-100/80">
              {{ t('collective.subtitle') }}
            </p>
          </div>
          <span class="relative inline-flex items-center gap-2 text-sm font-semibold text-brand-900 dark:text-brand-50 px-3 py-2 rounded-full bg-white/85 dark:bg-white/10 shadow-sm overflow-hidden cta-scale">
            <span class="pointer-events-none absolute inset-[-2px] rounded-full border border-brand-400/40 dark:border-brand-300/30" aria-hidden="true" />
            {{ t('collective.cta') }}
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-scale {
  animation: cta-scale 2.6s ease-in-out infinite;
}
@keyframes cta-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}
</style>
