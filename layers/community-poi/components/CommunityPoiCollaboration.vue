<script setup lang="ts">
import {
  POI_CALLOUT,
  POI_CALLOUT_BODY,
  POI_CALLOUT_LINK,
  POI_CALLOUT_TITLE,
  type PoiCalloutTone,
} from '../utils/poiCalloutClasses'
import { computed } from '#imports'
import type { CommunityPoi } from '../types'

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

// Open for contributions reads as an invitation (secondary); showcase-only
// as a notice (brand orange).
const tone = computed<PoiCalloutTone>(() => (isOpen.value ? 'secondary' : 'brand-orange'))
</script>

<template>
  <aside
    :class="POI_CALLOUT[tone]"
    :aria-label="t('community_poi.collaboration.aria')"
  >
    <h2 :class="POI_CALLOUT_TITLE">
      <IconFa
        :icon="['fas', isOpen ? 'handshake' : 'lock']"
        class="h-4 w-4"
        aria-hidden="true"
      />
      {{ isOpen
        ? t('community_poi.collaboration.open_title')
        : t('community_poi.collaboration.closed_title') }}
    </h2>
    <p :class="POI_CALLOUT_BODY">
      {{ isOpen
        ? t('community_poi.collaboration.open_body')
        : t('community_poi.collaboration.closed_body') }}
    </p>

    <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-body-medium">
      <li v-if="forumUrl">
        <a
          :href="forumUrl"
          :class="POI_CALLOUT_LINK"
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
          :class="POI_CALLOUT_LINK"
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
          :class="POI_CALLOUT_LINK"
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
