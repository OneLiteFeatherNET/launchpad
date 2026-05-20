<script setup lang="ts">
import { computed } from '#imports'
import IconFa from '~/components/base/icons/IconFa.vue'
import type { CommunityPoi } from '~/types/community-poi'

const props = defineProps<{
  poi: CommunityPoi
}>()

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const discordUrl = (runtimeConfig.public?.discordUrl as string | undefined)
  || 'https://1lf.link/discord'
const githubUrl = 'https://github.com/OneLiteFeatherNET/launchpad/tree/main/content/community-poi'

// `undefined` is treated as open — POIs default to community-friendly. Only an
// explicit `acceptsContributions: false` switches the block into showcase
// mode, which removes the contribute CTAs but keeps the forum link visible.
const isOpen = computed(() => props.poi.acceptsContributions !== false)
const forumUrl = computed(() => props.poi.forumUrl)

const accent = computed(() => isOpen.value ? 'var(--color-brand-secondary)' : 'var(--color-brand-orange)')

const wrapperStyle = computed(() => ({
  borderLeftColor: accent.value,
  background: `color-mix(in oklab, ${accent.value} 6%, transparent)`
}))

const headingClass = 'text-base font-semibold text-[var(--color-text)]'

const linkClass = [
  'inline-flex items-center gap-1 underline underline-offset-2',
  'text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)] rounded'
].join(' ')
</script>

<template>
  <aside
    class="rounded-lg border-l-4 p-5"
    :style="wrapperStyle"
    :aria-label="t('community_poi.collaboration.aria')"
  >
    <h2 :class="['inline-flex items-center gap-2', headingClass]">
      <IconFa
        :icon="['fas', isOpen ? 'handshake' : 'lock']"
        class="h-4 w-4"
        :style="{ color: accent }"
        aria-hidden="true"
      />
      {{ isOpen
        ? t('community_poi.collaboration.open_title')
        : t('community_poi.collaboration.closed_title') }}
    </h2>
    <p class="mt-1 text-sm text-[var(--color-muted)]">
      {{ isOpen
        ? t('community_poi.collaboration.open_body')
        : t('community_poi.collaboration.closed_body') }}
    </p>

    <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <li v-if="forumUrl">
        <a
          :href="forumUrl"
          :class="linkClass"
          target="_blank"
          rel="noopener noreferrer external"
        >
          <IconFa :icon="['fas','comment']" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ t('community_poi.collaboration.forum_link') }}
          <span class="sr-only">{{ t('community_poi.schematics.opens_external') }}</span>
        </a>
      </li>
      <li v-if="isOpen">
        <a
          :href="discordUrl"
          :class="linkClass"
          target="_blank"
          rel="noopener noreferrer external"
        >
          <IconFa :icon="['fab','discord']" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ t('community_poi.contribute.discord') }}
          <span class="sr-only">{{ t('community_poi.schematics.opens_external') }}</span>
        </a>
      </li>
      <li v-if="isOpen">
        <a
          :href="githubUrl"
          :class="linkClass"
          target="_blank"
          rel="noopener noreferrer external"
        >
          <IconFa :icon="['fab','github']" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ t('community_poi.contribute.github') }}
          <span class="sr-only">{{ t('community_poi.schematics.opens_external') }}</span>
        </a>
      </li>
    </ul>
  </aside>
</template>
