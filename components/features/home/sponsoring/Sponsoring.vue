<script setup lang="ts">
import SectionHeading from '~/components/base/typography/SectionHeading.vue'

type Sponsor = {
  name: string
  url: string
  description?: string
  badge?: string
}

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  sponsors: Sponsor[]
}>(), {
  title: 'Sponsoring',
  subtitle: 'Partner, die unsere Infrastruktur ermöglichen'
})

const headingId = 'sponsoring-title'
const descriptionId = 'sponsoring-subtitle'
</script>

<template>
  <section id="sponsoring" class="relative isolate w-full">
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="mb-8 text-center">
        <SectionHeading :level="2" :id="headingId" :description-id="subtitle ? descriptionId : undefined">
          {{ title }}
          <template #description v-if="subtitle">
            {{ subtitle }}
          </template>
        </SectionHeading>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="sponsor in sponsors"
          :key="sponsor.name"
          :href="sponsor.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group block h-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          :aria-label="`Sponsor ${sponsor.name}`"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ sponsor.name }}
              </p>
              <p v-if="sponsor.description" class="mt-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {{ sponsor.description }}
              </p>
            </div>
            <span
              v-if="sponsor.badge"
              class="inline-flex shrink-0 items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 px-3 py-1 text-xs font-semibold ring-1 ring-brand-100/60 dark:ring-brand-900/60"
            >
              {{ sponsor.badge }}
            </span>
          </div>
          <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
            Mehr erfahren
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
