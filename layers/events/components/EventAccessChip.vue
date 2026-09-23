<script setup lang="ts">
import type { EventAccessMode } from '../types'

/**
 * Non-interactive label naming how to take part. Renders nothing for `open`:
 * open is the default, and labelling every open event would drown the ones
 * that need a sign-up or an invitation.
 */
const props = defineProps<{
  mode: EventAccessMode
}>()

const { t } = useI18n()
</script>

<template>
  <M3Chip
    v-if="props.mode !== 'open'"
    kind="label"
    color="secondary"
    :icon="['fas', 'lock']"
    :label="t(`events.access.${props.mode}`)"
  />
</template>
