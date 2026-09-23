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

const wrapperClass
  = 'rounded-large border border-outline-variant bg-surface-container-low p-5 text-on-surface'

/** The server rule: an error-container note with an accent bar. */
const ruleClass
  = 'mb-4 rounded-small border-l-4 border-error bg-error-container p-3 text-body-medium '
    + 'text-on-error-container'

const ruleHeadingClass = 'flex items-center gap-1 text-label-medium uppercase'

const titleClass = 'inline-flex items-center gap-2 text-title-medium text-on-surface'

const iconClass = 'h-4 w-4 text-primary'

const linkIconClass = 'h-3 w-3'

const summaryClass
  = 'flex cursor-pointer items-center justify-between gap-2 rounded-extra-small py-2 '
    + 'text-label-large text-on-surface focus-ring'

const chevronClass = [
  'h-3 w-3 transition-transform group-open:rotate-180', 'motion-reduce:transition-none'
].join(' ')

const linkClass
  = 'inline-flex items-center gap-1 rounded-extra-small text-primary underline '
    + 'underline-offset-2 hover:decoration-2 focus-ring'
</script>

<template>
  <section :aria-label="t('community_poi.litematica.aria')" :class="wrapperClass">
    <header class="mb-3">
      <h3 :class="titleClass">
        <IconFa :icon="['fas','cube']" :class="iconClass" aria-hidden="true" />
        {{ t('community_poi.litematica.title') }}
      </h3>
      <p class="mt-1 text-body-medium text-on-surface-variant">
        {{ t('community_poi.litematica.intro') }}
      </p>
    </header>

    <aside :class="ruleClass" role="note">
      <p :class="ruleHeadingClass">
        <IconFa :icon="['fas','triangle-exclamation']" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ t('community_poi.litematica.rule.title') }}
      </p>
      <p class="mt-1">
        {{ t('community_poi.litematica.rule.body') }}
      </p>
    </aside>

    <ul class="divide-y divide-outline-variant">
      <li v-for="(entry, idx) in faqs" :key="idx">
        <details class="group">
          <summary :class="summaryClass">
            <span>{{ entry.q }}</span>
            <IconFa :icon="['fas','chevron-down']" :class="chevronClass" aria-hidden="true" />
          </summary>
          <div class="pb-3 pt-1">
            <p class="text-body-medium text-on-surface-variant">
              {{ entry.a }}
            </p>
            <ul
              v-if="entry.links?.length"
              class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-body-medium"
            >
              <li v-for="link in entry.links" :key="link.href">
                <a
                  :href="link.href"
                  :class="linkClass"
                  target="_blank"
                  rel="noopener noreferrer external"
                >
                  <IconFa
                    :icon="['fas','arrow-up-right-from-square']"
                    :class="linkIconClass"
                    aria-hidden="true"
                  />
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
