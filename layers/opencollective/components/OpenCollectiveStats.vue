<script setup lang="ts">
import { computed, useI18n } from '#imports'

type Props = {
  title?: string
  subtitle?: string
  totalRaised: number
  goal?: number
  contributors?: number | null
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

const statCardClass = 'rounded-extra-large border border-outline-variant bg-surface-container-low p-5 sm:p-6'

/** The call to give: tertiary container, like the sponsoring contact card. */
const ctaCardClass
  = 'state-layer group relative flex flex-col justify-between overflow-hidden rounded-extra-large '
    + 'bg-tertiary-container p-5 text-on-tertiary-container shadow-elevation-1 transition-shadow '
    + 'duration-150 ease-standard hover:shadow-elevation-3 focus-ring sm:p-6'
const ctaBadgeClass
  = 'inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-label-medium text-on-surface'
const ctaPillClass
  = 'inline-flex w-fit items-center gap-2 rounded-full bg-tertiary px-4 py-2 text-label-large '
    + 'text-on-tertiary motion-safe:animate-[pulse_2.8s_ease-in-out_infinite]'
</script>

<template>
  <section
    id="opencollective"
    class="relative isolate w-full"
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
        <div :class="statCardClass">
          <p class="text-label-large text-on-surface-variant">{{ t('collective.raised') }}</p>
          <p class="mt-1 text-headline-medium font-bold text-on-surface">{{ formattedRaised }}</p>
          <p v-if="formattedGoal" class="text-body-medium text-on-surface-variant">
            {{ t('collective.of_goal', { goal: formattedGoal }) }}
          </p>
          <!-- A progressbar now, not an image: its value is exposed, not only a label. -->
          <div v-if="goalValue" class="mt-4">
            <M3LinearProgress
              size="md"
              :value="progress"
              :label="t('collective.raised')"
              :value-text="progressLabel"
            />
            <p class="mt-2 text-body-medium text-on-surface-variant">
              {{ progressLabel }}
            </p>
          </div>
        </div>

        <div :class="statCardClass" class="flex flex-col justify-between">
          <div>
            <p class="text-label-large text-on-surface-variant">
              {{ t('collective.contributors') }}
            </p>
            <p class="mt-1 text-headline-medium font-bold text-on-surface">
              {{ props.contributors ?? '—' }}
            </p>
          </div>
          <p v-if="updatedLabel" class="mt-4 text-body-small text-on-surface-variant">
            {{ updatedLabel }}
          </p>
        </div>

        <a
          :href="props.link"
          target="_blank"
          rel="noopener noreferrer"
          :class="ctaCardClass"
          :aria-label="t('collective.cta')"
          data-ph-capture-attribute="cta"
          data-ph-capture-attribute-name="open-collective"
        >
          <div>
            <p :class="ctaBadgeClass">
              {{ t('collective.raised') }}
              <span
                class="size-2 rounded-full bg-tertiary motion-safe:animate-pulse"
                aria-hidden="true"
              />
            </p>
            <p class="mt-3 text-title-large font-bold">
              {{ t('collective.cta') }}
            </p>
            <p class="mt-2 text-body-medium">
              {{ t('collective.subtitle') }}
            </p>
          </div>
          <span :class="ctaPillClass">
            {{ t('collective.cta') }}
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
