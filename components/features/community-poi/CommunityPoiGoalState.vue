<script setup lang="ts">
defineProps<{
  goal?: string
  currentState?: string
}>()

const { t } = useI18n()

const goalCard = [
  'rounded-lg border-l-4 p-4',
  'border-[var(--color-brand-primary)]',
  'bg-[color-mix(in_oklab,var(--color-brand-primary)_8%,transparent)]'
].join(' ')

const goalHeading = [
  'text-sm font-semibold uppercase tracking-wide',
  'text-[color-mix(in_oklab,var(--color-brand-primary)_75%,black)]',
  'dark:text-[color-mix(in_oklab,var(--color-brand-primary)_25%,white)]'
].join(' ')

const currentCard = [
  'rounded-lg border-l-4 p-4',
  'border-[var(--color-brand-orange)]',
  'bg-[color-mix(in_oklab,var(--color-brand-orange)_8%,transparent)]'
].join(' ')

const currentHeading = [
  'text-sm font-semibold uppercase tracking-wide',
  'text-[color-mix(in_oklab,var(--color-brand-orange)_70%,black)]',
  'dark:text-[color-mix(in_oklab,var(--color-brand-orange)_30%,white)]'
].join(' ')

const bodyClass = 'mt-1 whitespace-pre-line text-sm text-neutral-800 dark:text-neutral-100'
</script>

<template>
  <section
    v-if="goal || currentState"
    :aria-label="t('community_poi.goal_state.aria')"
    class="grid gap-4 md:grid-cols-2"
  >
    <article v-if="goal" :class="goalCard">
      <h3 :class="goalHeading">
        {{ t('community_poi.goal_state.goal') }}
      </h3>
      <p :class="bodyClass">{{ goal }}</p>
    </article>
    <article v-if="currentState" :class="currentCard">
      <h3 :class="currentHeading">
        {{ t('community_poi.goal_state.current') }}
      </h3>
      <p :class="bodyClass">{{ currentState }}</p>
    </article>
  </section>
</template>
