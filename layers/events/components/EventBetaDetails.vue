<script setup lang="ts">
import type { EventAccessMode, EventSubject } from '../types'

/**
 * Beta block: open or closed — derived from the access mode, not stored
 * twice — and what is being tested.
 */
const props = defineProps<{
  subject?: EventSubject
  accessMode: EventAccessMode
}>()

const { t } = useI18n()
const stage = computed(() => (props.accessMode === 'open' ? 'events.beta.open' : 'events.beta.closed'))
</script>

<template>
  <dl class="grid gap-3 sm:grid-cols-2">
    <div>
      <dt class="text-label-large text-on-surface-variant">{{ t('events.beta.stage') }}</dt>
      <dd class="text-body-large text-on-surface">{{ t(stage) }}</dd>
    </div>
    <div v-if="subject">
      <dt class="text-label-large text-on-surface-variant">{{ t('events.beta.subject') }}</dt>
      <dd class="text-body-large text-on-surface">
        {{ subject.name }}
        <span class="text-body-medium text-on-surface-variant">
          ({{ t(`events.beta.kind.${subject.kind}`) }})
        </span>
      </dd>
    </div>
  </dl>
</template>
