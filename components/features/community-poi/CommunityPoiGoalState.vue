<script setup lang="ts">
defineProps<{
  goal?: string
  currentState?: string
}>()

const { t } = useI18n()

const goalCard = [
  'rounded-lg border-l-4 border-emerald-500 bg-emerald-50/60 p-4', 'dark:border-emerald-400 dark:bg-emerald-500/10'
].join(' ')

const goalHeading = [
  'text-sm font-semibold uppercase tracking-wide', 'text-emerald-800 dark:text-emerald-200'
].join(' ')

const currentCard = [
  'rounded-lg border-l-4 border-amber-500 bg-amber-50/60 p-4', 'dark:border-amber-400 dark:bg-amber-500/10'
].join(' ')

const currentHeading = [
  'text-sm font-semibold uppercase tracking-wide', 'text-amber-800 dark:text-amber-200'
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
