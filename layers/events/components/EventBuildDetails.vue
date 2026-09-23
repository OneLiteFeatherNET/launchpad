<script setup lang="ts">
import type { EventBuildInfo } from '../types'

/** Build-event block: theme and submission deadline. Results live in EventResults. */
defineProps<{
  build?: EventBuildInfo
}>()

const { t } = useI18n()
</script>

<template>
  <dl v-if="build && (build.theme || build.submissionDeadline)" class="grid gap-3 sm:grid-cols-2">
    <div v-if="build.theme">
      <dt class="text-label-large text-on-surface-variant">{{ t('events.build.theme') }}</dt>
      <dd class="text-body-large text-on-surface">{{ build.theme }}</dd>
    </div>
    <div v-if="build.submissionDeadline">
      <dt class="text-label-large text-on-surface-variant">{{ t('events.build.deadline') }}</dt>
      <dd class="text-body-large text-on-surface">
        <DateRange :start="build.submissionDeadline" />
      </dd>
    </div>
  </dl>
</template>
