<script setup lang="ts">
import { computed, useI18n } from '#imports'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'

const props = withDefaults(defineProps<{
  copied: boolean
  ariaLabel: string
  labelKey: string
  buttonClass?: string
  onCopy: () => void | Promise<void>
}>(), {
  buttonClass: ''
})

const { t } = useI18n()
const icon = computed(() => (props.copied ? faCheck : faCopy))
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 active:scale-[0.98] w-full md:w-auto justify-center"
    :class="buttonClass"
    :aria-label="ariaLabel"
    @click="onCopy"
  >
    <FontAwesomeIcon :icon="icon" class="text-base" aria-hidden="true" />
    <span v-if="!copied">{{ t(labelKey) }}</span>
    <span v-else>{{ t('server.connect.copied') }}</span>
  </button>
</template>
