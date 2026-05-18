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
    <div class="flex h-full flex-col rounded-2xl border border-dashed border-primary/40 dark:border-secondary/50 bg-primary/5 dark:bg-primary/10 p-4">
      <div class="flex items-center gap-4">
        <span
          class="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/25 text-primary dark:text-secondary text-2xl font-bold"
          aria-hidden="true"
        >+</span>
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary dark:text-secondary">
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
        class="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :aria-label="t('team.open_position.apply_aria', { role: props.role })"
      >
        <FontAwesomeIcon :icon="faDiscord" class="h-4 w-4" aria-hidden="true" />
        {{ t('team.open_position.apply') }}
      </a>
    </div>
  </li>
</template>
