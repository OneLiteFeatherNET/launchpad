<script setup lang="ts">
import { computed } from '#imports'

const { t, tm, rt } = useI18n()

// vue-i18n returns a normalized array via `tm` so we can render n FAQ
// entries without hard-coding each i18n key in the template.
interface FaqEntry { q: string, a: string }

const faqs = computed<FaqEntry[]>(() => {
  const raw = tm('community_poi.litematica.faq.entries') as unknown
  if (!Array.isArray(raw)) return []
  return (raw as FaqEntry[]).map((entry) => ({
    q: rt(entry.q as unknown as string),
    a: rt(entry.a as unknown as string)
  }))
})

const wrapperClass = [
  'rounded-lg border border-neutral-200 bg-neutral-50 p-5', 'dark:border-neutral-800 dark:bg-neutral-900/60'
].join(' ')

const summaryClass = [
  'flex cursor-pointer items-center justify-between gap-2 py-2',
  'text-sm font-medium text-neutral-900 dark:text-neutral-100',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary,#6366f1)]',
  'rounded'
].join(' ')

const chevronClass = [
  'text-xs transition-transform group-open:rotate-180', 'motion-reduce:transition-none'
].join(' ')
</script>

<template>
  <section :aria-label="t('community_poi.litematica.aria')" :class="wrapperClass">
    <header class="mb-3">
      <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-50">
        <span aria-hidden="true" class="mr-1">📐</span>
        {{ t('community_poi.litematica.title') }}
      </h3>
      <p class="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
        {{ t('community_poi.litematica.intro') }}
      </p>
    </header>

    <ul class="divide-y divide-neutral-200 dark:divide-neutral-800">
      <li v-for="(entry, idx) in faqs" :key="idx">
        <details class="group">
          <summary :class="summaryClass">
            <span>{{ entry.q }}</span>
            <span aria-hidden="true" :class="chevronClass">▾</span>
          </summary>
          <p
            class="pb-3 pt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
          >
            {{ entry.a }}
          </p>
        </details>
      </li>
    </ul>
  </section>
</template>
