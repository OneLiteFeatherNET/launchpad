<script setup lang="ts">
import {
  POI_CALLOUT,
  POI_CALLOUT_BODY,
  POI_CALLOUT_LINK,
  POI_CALLOUT_TITLE,
} from '../utils/poiCalloutClasses'

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const discordUrl = (runtimeConfig.public?.discordUrl as string | undefined)
  || 'https://1lf.link/discord'

// Edit-on-GitHub link points at the content folder so contributors can open a
// PR directly with a new POI markdown or extra gallery images.
const githubUrl = 'https://github.com/OneLiteFeatherNET/launchpad/tree/main/content/community-poi'
</script>

<template>
  <aside :class="POI_CALLOUT.secondary" :aria-label="t('community_poi.contribute.aria')">
    <h2 :class="POI_CALLOUT_TITLE">
      <IconFa :icon="['fas','image']" class="h-4 w-4" aria-hidden="true" />
      {{ t('community_poi.contribute.title') }}
    </h2>
    <p :class="POI_CALLOUT_BODY">
      {{ t('community_poi.contribute.body') }}
    </p>
    <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-body-medium">
      <li>
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
      <li>
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
