<script setup lang="ts">
import type { ServerConceptPoint } from '../types'
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

      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <M3Card
          v-for="(p, idx) in points"
          :key="p.id ?? idx"
          as="article"
          variant="elevated"
          class="h-full"
        >
          <header class="mb-3 flex items-center gap-3">
            <FontAwesomeIcon
              :icon="iconFor(p.icon)"
              class="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <h3 class="text-title-large text-on-surface">{{ p.title }}</h3>
          </header>
          <p class="text-body-large text-on-surface-variant">{{ p.text }}</p>
        </M3Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
