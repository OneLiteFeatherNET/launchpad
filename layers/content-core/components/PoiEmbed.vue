<script setup lang="ts">
import type { ChipLabelColor } from '#layers/base'
import { computed, useId } from 'vue'
import type { CommunityPoiEmbed } from '../utils/content/repository'
import type { Locale } from '../utils/content/locales'

/**
 * A community POI as a card inside an article: `::poi-embed{slug="yggdrasil"}`.
 * The card is server-rendered. An unknown slug renders nothing, and warns in
 * development so the author notices the typo before it ships.
 */
const props = defineProps<{ slug: string }>()

const { t, locale } = useI18n()
const repo = useContentRepository()

const { data } = useAsyncData(
  () => `poi-embed:${locale.value}:${props.slug}`,
  async () => {
    const [found] = await repo.listCommunityPoiEmbedsBySlugs(locale.value as Locale, [props.slug])
    // import.meta.env.DEV, not import.meta.dev: the latter is false under the nuxt test runner.
    if (!found && import.meta.env.DEV) {
      console.warn(`[poi-embed] no community POI "${props.slug}" for locale "${locale.value}"`)
    }
    return found ?? null
  },
  { watch: [locale, () => props.slug] }
)

const poi = computed(() => data.value)
const titleId = useId()
const detailPath = computed(() => `/${locale.value}/community-poi/${props.slug}`)

// Same colours as CommunityPoiStatusBadge, so a status reads the same here.
const STATUS_COLOR: Record<CommunityPoiEmbed['status'], ChipLabelColor> = {
  'in-progress': 'brand-orange',
  'planning': 'secondary',
  'paused': 'neutral',
  'completed': 'primary',
}

const statusLabel = computed(() => (poi.value ? t(`community_poi.status.${poi.value.status}`) : ''))
const statusColor = computed(() => (poi.value ? STATUS_COLOR[poi.value.status] : 'neutral'))
const cardClass = 'not-prose my-6 overflow-hidden rounded-large border border-outline-variant '
  + 'bg-surface-container-low shadow-elevation-1 sm:flex'
const progress = computed(() => Math.max(0, Math.min(100, Math.round(poi.value?.progress ?? 0))))
const builderNames = computed(() => (poi.value?.builders ?? []).map((b) => b.name).join(', '))
</script>

<template>
  <article
    v-if="poi"
    :aria-labelledby="titleId"
    :class="cardClass"
  >
    <NuxtPicture
      v-if="poi.thumbnail"
      class="block aspect-video w-full sm:w-72 sm:shrink-0"
      :src="poi.thumbnail"
      :alt="poi.thumbnailAlt || poi.title"
      :width="1600"
      :height="900"
      sizes="xs:100vw sm:288px"
      fit="cover"
      quality="75"
      loading="lazy"
      format="avif,webp"
      :img-attrs="{ class: 'h-full w-full object-cover' }"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-3 p-5">
      <div class="flex flex-wrap items-center gap-2">
        <M3Chip kind="label" :color="statusColor" :label="statusLabel" />
      </div>
      <h3 :id="titleId" class="text-title-large text-on-surface">
        <NuxtLink
          :to="detailPath"
          class="rounded-extra-small underline-offset-2 hover:underline focus-ring"
        >
          {{ poi.title }}
        </NuxtLink>
      </h3>
      <p class="text-body-medium text-on-surface-variant">{{ poi.summary }}</p>
      <M3LinearProgress
        v-if="poi.status !== 'completed'"
        :value="progress"
        :label="t('mdc.poi_embed.progress')"
        :value-text="t('mdc.poi_embed.progress_value', { value: progress })"
      />
      <p v-if="builderNames" class="text-body-small text-on-surface-variant">
        {{ t('mdc.poi_embed.builders') }}: <span class="text-on-surface">{{ builderNames }}</span>
      </p>
      <Coords
        v-if="poi.coordinates"
        :x="poi.coordinates.x"
        :y="poi.coordinates.y"
        :z="poi.coordinates.z"
        :world="poi.coordinates.dimension"
      />
    </div>
  </article>
</template>
