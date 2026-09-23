<script setup lang="ts">
import type { IconName } from '../types'
import IconFa from './IconFa.vue'
import M3Button from './M3Button.vue'

/**
 * "Nothing here right now", with an optional way on. A plain note, not an
 * alert: an empty list is an expected state, so it carries no live-region
 * role that would make a screen reader announce it as news.
 */
withDefaults(defineProps<{
  text: string
  icon?: IconName
  actionLabel?: string
  /** Internal route for the action. */
  actionTo?: string
  /** External URL for the action; opens in a new tab. */
  actionHref?: string
}>(), {
  icon: undefined,
  actionLabel: undefined,
  actionTo: undefined,
  actionHref: undefined,
})
</script>

<template>
  <div
    class="flex flex-col items-start gap-3 rounded-large bg-surface-container-low p-6
      sm:flex-row sm:items-center"
  >
    <IconFa
      v-if="icon"
      :icon="icon"
      class="size-6 shrink-0 text-on-surface-variant"
      aria-hidden="true"
    />
    <p class="flex-1 text-body-large text-on-surface-variant">{{ text }}</p>
    <M3Button
      v-if="actionLabel && (actionTo || actionHref)"
      variant="tonal"
      :to="actionTo"
      :href="actionHref"
      :target="actionHref ? '_blank' : undefined"
    >
      {{ actionLabel }}
    </M3Button>
  </div>
</template>
