<script setup lang="ts">
import IconFa from '~/components/base/icons/IconFa.vue'

defineProps<{
  lore: string
}>()

const { t } = useI18n()

const cardClass = [
  'rounded-lg border-l-4 p-5',
  'border-[var(--color-brand-purple)]',
  'bg-[color-mix(in_oklab,var(--color-brand-purple)_8%,transparent)]'
].join(' ')

const headingClass = [
  'text-sm font-semibold uppercase tracking-wide',
  'text-[color-mix(in_oklab,var(--color-brand-purple)_75%,black)]',
  'dark:text-[color-mix(in_oklab,var(--color-brand-purple)_30%,white)]'
].join(' ')

const bodyClass = [
  'mt-2 whitespace-pre-line text-sm leading-relaxed', 'text-neutral-800 dark:text-neutral-100'
].join(' ')
</script>

<template>
  <article :class="cardClass" :aria-label="t('community_poi.lore.aria')">
    <h3 :class="['inline-flex items-center gap-2', headingClass]">
      <IconFa :icon="['fas','book-open']" class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t('community_poi.lore.title') }}
    </h3>
    <p :class="bodyClass">{{ lore }}</p>
  </article>
</template>
