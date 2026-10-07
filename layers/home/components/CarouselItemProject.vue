<script setup lang="ts">
import {
  CAROUSEL_CAPTION,
  CAROUSEL_CAPTION_POSITION,
  CAROUSEL_META,
  CAROUSEL_SCRIM,
  CAROUSEL_TEXT,
  CAROUSEL_TITLE,
  CAROUSEL_TITLE_LINK,
} from '../utils/carouselClasses'
import { computed } from '#imports'

interface ProjectItem {
  type: 'project'
  title: string
  href: string
  summary?: string
  image?: string
  alt?: string
  status?: 'active' | 'maintenance' | 'archived'
  platforms?: string[]
  isNew?: boolean
}

const props = withDefaults(defineProps<{
  item: ProjectItem
  priority?: boolean
}>(), {
  priority: false
})

const { t } = useI18n()

const statusLabel = computed(() => props.item.status ? t(`projects.status.${props.item.status}`) : '')

/** Shown when the project has no logo. */
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
          <M3Chip v-if="item.isNew" kind="label" color="tertiary" :label="t('carousel.new')" />
          <M3Chip kind="label" color="secondary" :label="t('carousel.project_tag')" />
          <M3Chip v-if="statusLabel" kind="label" :label="statusLabel" />
          <M3Chip
            v-for="platform in item.platforms ?? []"
            :key="platform"
            kind="label"
            :label="platform"
          />
        </div>

        <h3 :class="CAROUSEL_TITLE">
          <NuxtLink
            :to="item.href"
            :class="CAROUSEL_TITLE_LINK"
            :aria-label="t('carousel.project_title_aria', { title: item.title })"
          >
            {{ item.title }}
          </NuxtLink>
        </h3>

        <p v-if="item.summary" :class="CAROUSEL_TEXT">
          {{ item.summary }}
        </p>

        <M3Button
          variant="tonal"
          :to="item.href"
          :aria-label="t('carousel.project_cta_aria', { title: item.title })"
        >
          {{ t('carousel.project_cta') }}
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" aria-hidden="true" />
        </M3Button>
      </div>
    </div>
  </article>
</template>
