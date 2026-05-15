<script setup lang="ts">
import { extractPlainText } from '~/utils/content'

const { t } = useI18n()
const { items } = useFaqContent()

const detailsClass = [
  'group rounded-xl border border-neutral-200 dark:border-neutral-800',
  'bg-white dark:bg-neutral-900/60 px-4 py-3 open:shadow-sm',
  'transition-shadow'
].join(' ')

const summaryClass = [
  'flex cursor-pointer list-none items-center justify-between gap-4',
  'text-base font-semibold text-neutral-900 dark:text-neutral-100',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md'
].join(' ')

const toggleClass = [
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
  'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
  'transition-transform group-open:rotate-45'
].join(' ')

const proseClass = [
  'prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none mt-3', 'prose-a:text-primary prose-a:underline-offset-2 prose-a:hover:underline'
].join(' ')

// FAQPage schema mirrors the visible content. Google currently restricts FAQ
// rich results to authoritative health/government sites, but the markup is
// still picked up by other crawlers (Bing, DuckDuckGo, AI assistants). The
// schema requires plain-text answers, so we strip the MDC AST down.
useSchemaOrg(() => {
  if (!items.value.length) return []
  return [
    {
      '@type': 'FAQPage',
      mainEntity: items.value.map((entry) => ({
        '@type': 'Question' as const,
        name: entry.question,
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: extractPlainText(entry.body, 500)
        }
      }))
    }
  ]
})
</script>

<template>
  <section
    v-if="items.length"
    class="mx-auto max-w-4xl px-4 py-10 md:py-14"
    :aria-labelledby="'faq-heading'"
  >
    <header class="mb-6 text-center">
      <h2
        id="faq-heading"
        class="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
      >
        {{ t('faq.section_title') }}
      </h2>
      <p class="mt-2 text-sm md:text-base text-neutral-600 dark:text-neutral-400">
        {{ t('faq.section_subtitle') }}
      </p>
    </header>

    <div class="space-y-3">
      <details
        v-for="entry in items"
        :key="entry.key"
        :class="detailsClass"
      >
        <summary :class="summaryClass">
          <span>{{ entry.question }}</span>
          <span :class="toggleClass" aria-hidden="true">+</span>
        </summary>
        <div :class="proseClass">
          <ContentRenderer :value="entry" />
        </div>
      </details>
    </div>
  </section>
</template>
