<script setup lang="ts">
import { computed } from '#imports'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faDesktop, faGamepad, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import type { ButtonVariant } from '#layers/base'

type Props = {
  title: string
  address: string
  secondaryLabel?: string
  secondaryValue?: string
  icon: string
  buttonVariant?: ButtonVariant
  copied: boolean
  copiedSecondary?: boolean
  onCopy: () => void | Promise<void>
  onCopySecondary?: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  secondaryLabel: undefined,
  secondaryValue: undefined,
  buttonVariant: 'filled',
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
  <M3Card as="article" variant="outlined" class="h-full">
    <header class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FontAwesomeIcon :icon="mainIcon" class="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 class="text-title-large text-on-surface">{{ title }}</h3>
      </div>
    </header>
    <p class="mb-4 break-all font-mono text-body-large text-on-surface">
      <span class="underline decoration-outline underline-offset-4">
        {{ address }}
      </span>
    </p>
    <p v-if="secondaryValue" class="mb-2 font-mono text-body-medium text-on-surface">
      <span class="text-on-surface-variant">{{ secondaryLabel || 'Port' }}:</span>
      <span class="ml-2 underline decoration-outline underline-offset-4">{{ secondaryValue }}</span>
    </p>
    <div class="mt-auto flex flex-wrap items-center gap-3">
      <CopyButton
        :accessible-label="t('server.connect.copy_aria', { address })"
        :variant="buttonVariant"
        :copied="copied"
        label-key="server.connect.copy_address"
        :on-copy="onCopy"
        tracking-label="server-copy-java"
      />
      <CopyButton
        v-if="secondaryValue && onCopySecondary"
        :accessible-label="t('server.connect.copy_port_aria', { port: secondaryValue })"
        variant="tonal"
        :copied="copiedSecondary"
        label-key="server.connect.copy_port"
        :on-copy="onCopySecondary"
        tracking-label="server-copy-port"
      />
      <!-- SR-only live region -->
      <span class="sr-only" aria-live="polite">{{ copied ? t('server.connect.copied') : '' }}</span>
    </div>
  </M3Card>
</template>
