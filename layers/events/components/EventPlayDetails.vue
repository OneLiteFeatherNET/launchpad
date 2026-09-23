<script setup lang="ts">
import type { EventPlayInfo } from '../types'

/** Play-event block: what is played and in which team size. */
defineProps<{
  play?: EventPlayInfo
}>()

const { t } = useI18n()
</script>

<template>
  <dl v-if="play && (play.modeSummary || play.teamSize)" class="grid gap-3 sm:grid-cols-2">
    <div v-if="play.modeSummary">
      <dt class="text-label-large text-on-surface-variant">{{ t('events.play.mode') }}</dt>
      <dd class="text-body-large text-on-surface">{{ play.modeSummary }}</dd>
    </div>
    <div v-if="play.teamSize">
      <dt class="text-label-large text-on-surface-variant">{{ t('events.play.team_size') }}</dt>
      <dd class="text-body-large text-on-surface">{{ play.teamSize }}</dd>
    </div>
  </dl>
</template>
