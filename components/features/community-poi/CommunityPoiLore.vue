<script setup lang="ts">
defineProps<{
  lore: string
}>()

const { t } = useI18n()

const cardClass = [
  'rounded-lg border-l-4 border-fuchsia-500 bg-fuchsia-50/60 p-5', 'dark:border-fuchsia-400 dark:bg-fuchsia-500/10'
].join(' ')

const headingClass = [
  'text-sm font-semibold uppercase tracking-wide', 'text-fuchsia-800 dark:text-fuchsia-200'
].join(' ')

const bodyClass = [
  'mt-2 whitespace-pre-line text-sm leading-relaxed', 'text-neutral-800 dark:text-neutral-100'
].join(' ')
</script>

<template>
  <article :class="cardClass" :aria-label="t('community_poi.lore.aria')">
    <h3 :class="headingClass">
      <span aria-hidden="true" class="mr-1">📖</span>
      {{ t('community_poi.lore.title') }}
    </h3>
    <p :class="bodyClass">{{ lore }}</p>
  </article>
</template>
