<script setup lang="ts">
import { computed } from '#imports'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faDesktop, faGamepad, faCopy, faCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

type Props = {
  title: string
  address: string
  secondaryLabel?: string
  secondaryValue?: string
  icon: string
  iconClass?: string
  buttonClass?: string
  copied: boolean
  copiedSecondary?: boolean
  onCopy: () => void | Promise<void>
  onCopySecondary?: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  secondaryLabel: undefined,
  secondaryValue: undefined,
  iconClass: '',
  buttonClass: '',
  copiedSecondary: false,
  onCopySecondary: undefined
})

const { t } = useI18n()

const iconMap: Record<string, IconDefinition> = {
  desktop_windows: faDesktop,
  stadia_controller: faGamepad
}

const mainIcon = computed<IconDefinition>(() => iconMap[props.icon] ?? faCircleInfo)
const copyIconPrimary = computed<IconDefinition>(() => (props.copied ? faCheck : faCopy))
const copyIconSecondary = computed<IconDefinition>(() => (props.copiedSecondary ? faCheck : faCopy))
</script>

<template>
  <article class="group flex h-full flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-4 shadow-md ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 transition hover:shadow-lg md:p-6">
    <header class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FontAwesomeIcon :icon="mainIcon" class="h-5 w-5" :class="iconClass" aria-hidden="true" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
      </div>
    </header>
    <p class="mb-4 break-all font-mono text-base text-gray-900 dark:text-gray-100">
      <span class="underline decoration-gray-400 dark:decoration-gray-500 underline-offset-4 hover:decoration-emerald-500 dark:hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900">
        {{ address }}
      </span>
    </p>
    <p v-if="secondaryValue" class="mb-2 font-mono text-sm text-gray-700 dark:text-gray-200">
      <span class="text-gray-500 dark:text-gray-400">{{ secondaryLabel || 'Port' }}:</span>
      <span class="ml-2 underline decoration-gray-400 dark:decoration-gray-500 underline-offset-4">{{ secondaryValue }}</span>
    </p>
    <div class="mt-auto flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 active:scale-[0.98]"
        :class="buttonClass"
        :aria-label="t('server.connect.copy_aria', { address })"
        @click="onCopy"
      >
        <FontAwesomeIcon :icon="copyIconPrimary" class="text-base" aria-hidden="true" />
        <span v-if="!copied">{{ t('server.connect.copy') }}</span>
        <span v-else>{{ t('server.connect.copied') }}</span>
      </button>
      <button
        v-if="secondaryValue && onCopySecondary"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 active:scale-[0.98]"
        :class="buttonClass"
        :aria-label="t('server.connect.copy_port_aria', { port: secondaryValue })"
        @click="onCopySecondary"
      >
        <FontAwesomeIcon :icon="copyIconSecondary" class="text-base" aria-hidden="true" />
        <span v-if="!copiedSecondary">{{ t('server.connect.copy_port') }}</span>
        <span v-else>{{ t('server.connect.copied') }}</span>
      </button>
      <!-- SR-only live region -->
      <span class="sr-only" aria-live="polite">{{ copied ? t('server.connect.copied') : '' }}</span>
    </div>
  </article>
</template>
