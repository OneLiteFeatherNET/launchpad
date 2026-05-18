<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'

type Props = {
  role: string
  slogan?: string
  applyUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  slogan: undefined,
  applyUrl: 'https://1lf.link/discord'
})

const { t } = useI18n()
</script>

<template>
  <li class="shrink-0 w-72">
    <div class="flex h-full flex-col rounded-2xl border border-dashed border-brand-400/70 dark:border-brand-500/60 bg-brand-50/40 dark:bg-brand-950/20 p-4">
      <div class="flex items-center gap-4">
        <span
          class="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 text-2xl font-bold"
          aria-hidden="true"
        >+</span>
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {{ t('team.open_position.badge') }}
          </p>
          <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{{ props.role }}</h3>
        </div>
      </div>
      <p v-if="props.slogan" class="mt-3 line-clamp-3 text-sm text-gray-700 dark:text-gray-300">{{ props.slogan }}</p>
      <a
        :href="props.applyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        :aria-label="t('team.open_position.apply_aria', { role: props.role })"
      >
        <FontAwesomeIcon :icon="faDiscord" class="h-4 w-4" aria-hidden="true" />
        {{ t('team.open_position.apply') }}
      </a>
    </div>
  </li>
</template>
