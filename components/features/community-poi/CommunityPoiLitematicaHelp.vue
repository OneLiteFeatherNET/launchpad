<script setup lang="ts">
import { computed } from '#imports'

const { t, tm, rt } = useI18n()

interface FaqLink {
  label: string
  href: string
}

interface FaqEntry {
  q: string
  a: string
  links?: FaqLink[]
}

// vue-i18n returns the raw object tree via `tm`; we walk it ourselves so
// optional structured fields like `links[]` come through unaltered.
const faqs = computed<FaqEntry[]>(() => {
  const raw = tm('community_poi.litematica.faq.entries') as unknown
  if (!Array.isArray(raw)) return []
  return (raw as FaqEntry[]).map((entry) => ({
    q: rt(entry.q as unknown as string),
    a: rt(entry.a as unknown as string),
    links: Array.isArray(entry.links)
      ? entry.links.map((link) => ({
          label: rt(link.label as unknown as string),
          href: rt(link.href as unknown as string)
        }))
      : undefined
  }))
})

const wrapperClass = [
  'rounded-lg border border-neutral-200 bg-neutral-50 p-5', 'dark:border-neutral-800 dark:bg-neutral-900/60'
].join(' ')

const ruleClass = [
  'mb-4 rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-sm', 'dark:border-red-400 dark:bg-red-500/10'
].join(' ')

const ruleHeadingClass = [
  'flex items-center gap-1 font-semibold uppercase tracking-wide text-xs', 'text-red-800 dark:text-red-200'
].join(' ')

const summaryClass = [
  'flex cursor-pointer items-center justify-between gap-2 py-2',
  'text-sm font-medium text-neutral-900 dark:text-neutral-100',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]',
  'rounded'
].join(' ')

const chevronClass = [
  'text-xs transition-transform group-open:rotate-180', 'motion-reduce:transition-none'
].join(' ')

const linkClass = [
  'inline-flex items-center gap-1 text-[var(--color-brand-secondary)]',
  'underline underline-offset-2 hover:opacity-90',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)] rounded'
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

    <aside :class="ruleClass" role="note">
      <p :class="ruleHeadingClass">
        <span aria-hidden="true">⚠</span>
        {{ t('community_poi.litematica.rule.title') }}
      </p>
      <p class="mt-1 text-neutral-800 dark:text-neutral-100">
        {{ t('community_poi.litematica.rule.body') }}
      </p>
    </aside>

    <ul class="divide-y divide-neutral-200 dark:divide-neutral-800">
      <li v-for="(entry, idx) in faqs" :key="idx">
        <details class="group">
          <summary :class="summaryClass">
            <span>{{ entry.q }}</span>
            <span aria-hidden="true" :class="chevronClass">▾</span>
          </summary>
          <div class="pb-3 pt-1">
            <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {{ entry.a }}
            </p>
            <ul v-if="entry.links?.length" class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <li v-for="link in entry.links" :key="link.href">
                <a
                  :href="link.href"
                  :class="linkClass"
                  target="_blank"
                  rel="noopener noreferrer external"
                >
                  <span aria-hidden="true">↗</span>
                  <span>{{ link.label }}</span>
                  <span class="sr-only">
                    {{ t('community_poi.schematics.opens_external') }}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </details>
      </li>
    </ul>
  </section>
</template>
