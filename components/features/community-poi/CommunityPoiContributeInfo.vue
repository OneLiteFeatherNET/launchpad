<script setup lang="ts">
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const discordUrl = (runtimeConfig.public?.discordUrl as string | undefined)
  || 'https://1lf.link/discord'

// Edit-on-GitHub link points at the content folder so contributors can open a
// PR directly with a new POI markdown or extra gallery images.
const githubUrl = 'https://github.com/OneLiteFeatherNET/launchpad/tree/main/content/community-poi'

const wrapperClass = [
  'rounded-lg border-l-4 p-5',
  'border-[var(--color-brand-secondary)]',
  'bg-[color-mix(in_oklab,var(--color-brand-secondary)_6%,transparent)]'
].join(' ')

const linkClass = [
  'inline-flex items-center gap-1 underline underline-offset-2',
  'text-[var(--color-brand-secondary)]',
  'hover:text-[var(--color-brand-primary)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)] rounded'
].join(' ')
</script>

<template>
  <aside :class="wrapperClass" :aria-label="t('community_poi.contribute.aria')">
    <h2 class="text-base font-semibold text-[var(--color-text)]">
      <span aria-hidden="true" class="mr-1">📷</span>
      {{ t('community_poi.contribute.title') }}
    </h2>
    <p class="mt-1 text-sm text-[var(--color-muted)]">
      {{ t('community_poi.contribute.body') }}
    </p>
    <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <li>
        <a
          :href="discordUrl"
          :class="linkClass"
          target="_blank"
          rel="noopener noreferrer external"
        >
          <span aria-hidden="true">💬</span>
          {{ t('community_poi.contribute.discord') }}
          <span class="sr-only">{{ t('community_poi.schematics.opens_external') }}</span>
        </a>
      </li>
      <li>
        <a
          :href="githubUrl"
          :class="linkClass"
          target="_blank"
          rel="noopener noreferrer external"
        >
          <span aria-hidden="true">🔀</span>
          {{ t('community_poi.contribute.github') }}
          <span class="sr-only">{{ t('community_poi.schematics.opens_external') }}</span>
        </a>
      </li>
    </ul>
  </aside>
</template>
