<script setup lang="ts">
import type { AboutPillar } from '../types'

defineProps<{
  pillars: AboutPillar[]
}>()

const { locale } = useI18n()
</script>

<template>
  <ul v-if="pillars.length" class="grid gap-4 sm:grid-cols-2">
    <li v-for="pillar in pillars" :key="pillar.to" class="flex">
      <M3Card variant="outlined" interactive class="w-full">
        <div class="flex flex-1 flex-col gap-3">
          <span
            class="flex size-12 items-center justify-center rounded-medium
              bg-primary-container text-on-primary-container"
          >
            <IconFa :icon="['fas', pillar.icon]" class="size-6" aria-hidden="true" />
          </span>
          <h3 class="text-title-large text-on-surface">
            <M3CardLink :to="`/${locale}${pillar.to}`">
              {{ pillar.title }}
            </M3CardLink>
          </h3>
          <p class="text-body-medium text-on-surface-variant">
            {{ pillar.text }}
          </p>
        </div>
      </M3Card>
    </li>
  </ul>
</template>
