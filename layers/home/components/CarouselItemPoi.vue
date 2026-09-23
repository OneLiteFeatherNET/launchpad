<script setup lang="ts">
import {
  CAROUSEL_CAPTION,
  CAROUSEL_CAPTION_POSITION,
  CAROUSEL_SCRIM,
  CAROUSEL_TEXT,
  CAROUSEL_TITLE,
  CAROUSEL_TITLE_LINK,
} from '../utils/carouselClasses'
import { computed } from '#imports'

interface PoiItem {
  type: 'poi'
  title: string
  href: string
  caption?: string
  image?: string
  alt?: string
  status?: 'planning' | 'in-progress' | 'paused' | 'completed'
  progress?: number
  category?: 'team' | 'community' | 'collab'
}

const props = withDefaults(defineProps<{
  item: PoiItem
  priority?: boolean
}>(), {
  priority: false
})

const { t } = useI18n()

const statusLabel = computed(() => props.item.status ? t(`community_poi.status.${props.item.status}`) : '')
const categoryLabel = computed(() => props.item.category ? t(`community_poi.category.${props.item.category}`) : '')
const progressValue = computed(() => {
  if (typeof props.item.progress !== 'number') return null
  return Math.max(0, Math.min(100, Math.round(props.item.progress)))
})
const ctaLabel = computed(() => t('community_poi.carousel.cta'))
const ctaAria = computed(() => t('community_poi.carousel.cta_aria', { title: props.item.title }))
const titleAria = computed(() => t('community_poi.carousel.title_aria', { title: props.item.title }))


/** Shown when the POI has no image yet. */
const fallbackClass
  = 'absolute inset-0 bg-gradient-to-br from-surface-container-high to-surface-container-lowest'
</script>

<template>
  <article class="absolute inset-0 h-full w-full">
    <NuxtPicture
      v-if="item.image"
      :src="item.image"
      :alt="item.alt || item.title"
      sizes="sm:100vw md:100vw lg:1280px"
      densities="1x 2x"
      quality="75"
      :placeholder="false"
      format="avif,webp"
      :loading="priority ? 'eager' : 'lazy'"
      :preload="priority"
      :img-attrs="{
        class: 'absolute inset-0 h-full w-full object-cover',
        fetchpriority: priority ? 'high' : undefined
      }"
    />
    <div
      v-else
      :class="fallbackClass"
      aria-hidden="true"
    />

    <div :class="CAROUSEL_SCRIM" />

    <div :class="CAROUSEL_CAPTION_POSITION">
      <div :class="CAROUSEL_CAPTION">
        <div :class="CAROUSEL_META">
          <M3Chip kind="label" color="secondary" :label="t('community_poi.carousel.tag')" />
          <M3Chip v-if="categoryLabel" kind="label" :label="categoryLabel" />
          <M3Chip v-if="statusLabel" kind="label" :label="statusLabel" />
          <span v-if="progressValue !== null" class="tabular-nums">
            {{ progressValue }}%
          </span>
        </div>

        <h3 :class="CAROUSEL_TITLE">
          <NuxtLink :to="item.href" :class="CAROUSEL_TITLE_LINK" :aria-label="titleAria">
            {{ item.title }}
          </NuxtLink>
        </h3>

        <p v-if="item.caption" :class="CAROUSEL_TEXT">
          {{ item.caption }}
        </p>

        <M3Button variant="tonal" :to="item.href" :aria-label="ctaAria">
          {{ ctaLabel }}
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" aria-hidden="true" />
        </M3Button>
      </div>
    </div>
  </article>
</template>
