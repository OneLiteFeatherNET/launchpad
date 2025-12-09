<script setup lang="ts">
import { computed } from '#imports'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faDesktop, faGamepad, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import CopyButton from '~/components/base/buttons/CopyButton.vue'

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
      <CopyButton
        :aria-label="t('server.connect.copy_aria', { address })"
        :button-class="buttonClass || 'relative overflow-hidden bg-gradient-to-r from-brand-500 via-sky-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 hover:shadow-xl focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-500 after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-white/50 after:animate-ping'"
        :copied="copied"
        label-key="server.connect.copy_address"
        :on-copy="onCopy"
      />
      <CopyButton
        v-if="secondaryValue && onCopySecondary"
        :aria-label="t('server.connect.copy_port_aria', { port: secondaryValue })"
        :button-class="buttonClass"
        :copied="copiedSecondary"
        label-key="server.connect.copy_port"
        :on-copy="onCopySecondary"
      />
      <!-- SR-only live region -->
      <span class="sr-only" aria-live="polite">{{ copied ? t('server.connect.copied') : '' }}</span>
    </div>
  </article>
</template>
