<script setup lang="ts">
const { t } = useI18n()

/**
 * The keys here must match the entries under the `faq.items.*` namespace in
 * each locale file. Order is preserved when rendered.
 */
const itemKeys = ['what_is',
'editions',
'free',
'bluemap',
'contact'] as const

interface FaqEntry {
  key: typeof itemKeys[number]
  question: string
  answer: string
}

// Answer-level interpolation values. Kept here (and not in i18n JSON) so the
// literal "@" of the contact email never lands in a message string — Vue I18n
// would otherwise parse it as the start of a linked-message reference and fail
// to load the whole locale catalog.
const answerParams: Record<string, Record<string, string>> = {
  contact: {
    email: 'contact@onelitefeather.net',
    discord: 'https://1lf.link/discord',
    github: 'https://github.com/OneLiteFeatherNET'
  }
}

const items = computed<FaqEntry[]>(() => itemKeys.map((key) => ({
    key,
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`, answerParams[key] || {})
  })))

// FAQPage schema mirrors the visible content. Google currently restricts FAQ
// rich results to authoritative health/government sites, but the markup is
// still picked up by other crawlers (Bing, DuckDuckGo, AI assistants).
useSchemaOrg(() => ([
  {
    '@type': 'FAQPage',
    mainEntity: items.value.map((entry) => ({
      '@type': 'Question' as const,
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: entry.answer
      }
    }))
  }
]))

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
</script>

<template>
  <section
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
        <p
          class="mt-3 text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-300"
        >
          {{ entry.answer }}
        </p>
      </details>
    </div>
  </section>
</template>
