<script setup lang="ts">
import type { CommunityNumbers } from '../types'

defineProps<{
  numbers: CommunityNumbers
  /** Localized path of the community page. */
  to: string
}>()

const { t } = useI18n()

const panelClass
  = 'flex flex-col gap-4 rounded-extra-large bg-surface-container p-5 md:flex-row '
    + 'md:items-center md:justify-between md:p-6'
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-8 md:py-10" aria-labelledby="community-strip-title">
    <div :class="panelClass">
      <div class="min-w-0">
        <h2 id="community-strip-title" class="text-title-large font-bold text-on-surface">
          {{ t('community.strip.title') }}
        </h2>
        <CommunityStats :numbers="numbers" variant="strip" class="mt-4" />
      </div>
      <M3Button
        :to="to"
        variant="tonal"
        :icon="['fas', 'handshake']"
        class="shrink-0 self-start md:self-center"
      >
        {{ t('community.strip.cta') }}
      </M3Button>
    </div>
  </section>
</template>
