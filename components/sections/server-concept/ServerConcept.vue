<script setup lang="ts">
import SectionHeading from '~/components/ui/typography/SectionHeading.vue'
import type { ServerConceptPoint } from '~/types/home'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faUsers, faGamepad, faHandshake, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

type Props = {
  title: string
  subtitle?: string
  points: ServerConceptPoint[]
}

const props = defineProps<Props>()

// A11y: Stable IDs for heading & description so the section region can reference them correctly
const headingId = 'server-concept-title'
const descriptionId = 'server-concept-subtitle'

const iconMap: Record<string, IconDefinition> = {
  groups: faUsers,
  sports_esports: faGamepad,
  handshake: faHandshake
}

const iconFor = (name?: string): IconDefinition => iconMap[name ?? ''] ?? faCircleInfo
</script>

<template>
  <section
    class="relative isolate w-full"
    role="region"
    :aria-labelledby="headingId"
    :aria-describedby="props.subtitle ? descriptionId : undefined"
  >
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="mb-8 text-center">
        <SectionHeading :level="2" :id="headingId" :description-id="props.subtitle ? descriptionId : undefined">
          {{ title }}
          <template #description v-if="subtitle">
            {{ subtitle }}
          </template>
        </SectionHeading>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3" role="list">
        <article
          v-for="(p, idx) in points"
          :key="p.id ?? idx"
          class="h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 transition hover:shadow-md"
          role="listitem"
        >
          <header class="mb-3 flex items-center gap-3">
            <FontAwesomeIcon
              :icon="iconFor(p.icon)"
              class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ p.title }}</h3>
          </header>
          <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">{{ p.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
