<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons'

type Props = {
  role: string | string[]
  slogan?: string
  applyUrl?: string
  applyVia?: 'discord' | 'opencollective'
}

const props = withDefaults(defineProps<Props>(), {
  slogan: undefined,
  applyUrl: 'https://1lf.link/discord',
  applyVia: 'discord'
})

const { t } = useI18n()

const roleText = computed(() => toRoleString(props.role))
const isOpenCollective = computed(() => props.applyVia === 'opencollective')
const icon = computed(() => isOpenCollective.value ? faHandHoldingHeart : faDiscord)
const applyLabel = computed(() => isOpenCollective.value
  ? t('team.open_position.apply_opencollective')
  : t('team.open_position.apply'))
const applyAria = computed(() => isOpenCollective.value
  ? t('team.open_position.apply_aria_opencollective', { role: roleText.value })
  : t('team.open_position.apply_aria', { role: roleText.value }))

/** An empty seat: a dashed primary outline around a tinted container. */
const cardClass
  = 'flex h-full flex-col rounded-large border border-dashed border-primary/40 '
    + 'bg-primary-container/10 p-4'
const placeholderClass
  = 'flex h-16 w-16 items-center justify-center rounded-medium bg-primary-container '
    + 'text-headline-small font-bold text-on-primary-container'
</script>

<template>
  <li class="shrink-0 w-72">
    <div :class="cardClass">
      <div class="flex items-center gap-4">
        <span
          :class="placeholderClass"
          aria-hidden="true"
        >+</span>
        <div class="min-w-0">
          <p class="text-label-medium uppercase text-primary">
            {{ t('team.open_position.badge') }}
          </p>
          <h3 class="break-words text-title-large text-on-surface">{{ roleText }}</h3>
        </div>
      </div>
      <p v-if="props.slogan" class="mt-3 text-body-medium text-on-surface-variant">
        {{ props.slogan }}
      </p>
      <M3Button
        :href="props.applyUrl"
        target="_blank"
        :icon="icon"
        class="mt-4"
        :aria-label="applyAria"
      >
        {{ applyLabel }}
      </M3Button>
    </div>
  </li>
</template>
