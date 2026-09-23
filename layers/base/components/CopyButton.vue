<script setup lang="ts">
import { computed, useI18n } from '#imports'
import type { ButtonVariant } from '../types'
import M3Button from './M3Button.vue'

// A copy-to-clipboard action on top of M3Button: the icon and label flip to
// a check mark and "copied" once `copied` is set. Colour comes from the
// variant, never from classes handed in.
const props = withDefaults(defineProps<{
  copied: boolean
  /** Accessible name; the visible text alone does not say what is copied. */
  accessibleLabel: string
  labelKey: string
  variant?: ButtonVariant
  onCopy: () => void | Promise<void>
  trackingLabel?: string
}>(), {
  variant: 'filled',
  trackingLabel: ''
})

const { t } = useI18n()
const icon = computed<[string, string]>(() => (props.copied ? ['fas', 'check'] : ['fas', 'copy']))
</script>

<template>
  <M3Button
    :variant="variant"
    :icon="icon"
    class="w-full md:w-auto"
    :aria-label="accessibleLabel"
    data-ph-capture-attribute="cta"
    :data-ph-capture-attribute-name="trackingLabel || labelKey"
    @click="onCopy"
  >
    <span v-if="!copied">{{ t(labelKey) }}</span>
    <span v-else>{{ t('server.connect.copied') }}</span>
  </M3Button>
</template>
