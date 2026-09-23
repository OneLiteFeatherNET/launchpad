<script setup lang="ts">

const { t } = useI18n()
const { items } = useTeamFaqContent()

const detailsClass
  = 'group rounded-medium border border-outline-variant bg-surface-container-low px-4 py-3 '
    + 'open:shadow-elevation-1 transition-shadow duration-150 ease-standard'

const summaryClass = [
  'flex cursor-pointer list-none items-center justify-between gap-4',
  'text-title-medium text-on-surface rounded-small focus-ring'
].join(' ')

const toggleClass = [
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
  'bg-surface-container-highest text-on-surface-variant',
  'transition-transform group-open:rotate-45'
].join(' ')

// Answers are rendered markdown. The `prose` classes this used compiled to
// nothing — the typography plugin is not installed — so the few elements an
// answer uses are styled here directly.
const answerClass = [
  'mt-3 space-y-2 text-body-large text-on-surface-variant',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2'
].join(' ')

// Extra FAQPage schema scoped to the team page; Google currently restricts
// FAQ rich results to authoritative sources, but other crawlers (Bing,
// DuckDuckGo, AI assistants) still pick it up. Plain-text answers only,
// so we strip the MDC AST down.
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
    class="mt-12 md:mt-16"
    :aria-labelledby="'team-faq-heading'"
  >
    <header class="mb-6 text-center">
      <h2
        id="team-faq-heading"
        class="text-headline-medium font-bold text-on-surface"
      >
        {{ t('team.faq.section_title') }}
      </h2>
      <p class="mt-2 text-body-large text-on-surface-variant">
        {{ t('team.faq.section_subtitle') }}
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
        <div :class="answerClass">
          <ContentRenderer :value="entry" />
        </div>
      </details>
    </div>
  </section>
</template>
