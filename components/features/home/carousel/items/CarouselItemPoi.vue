<script setup lang="ts">
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

const chipRowClass = [
  'mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide', 'text-white/85'
].join(' ')

const ctaClass = [
  'inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5', 'text-sm font-medium text-black transition hover:bg-white'
].join(' ')
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
      class="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950"
      aria-hidden="true"
    />

    <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

    <div class="absolute inset-x-0 bottom-0 p-5 pb-14 sm:p-6 sm:pb-16">
      <div class="max-w-3xl rounded-lg bg-black/45 p-4 text-white backdrop-blur-sm">
        <div :class="chipRowClass">
          <span class="rounded-full bg-white/15 px-3 py-1">
            {{ t('community_poi.carousel.tag') }}
          </span>
          <span v-if="categoryLabel" class="rounded-full bg-white/15 px-3 py-1">
            {{ categoryLabel }}
          </span>
          <span v-if="statusLabel" class="rounded-full bg-white/15 px-3 py-1">
            {{ statusLabel }}
          </span>
          <span v-if="progressValue !== null" class="tabular-nums text-white/80">
            {{ progressValue }}%
          </span>
        </div>

        <h3 class="mb-2 text-xl font-semibold leading-snug sm:text-2xl">
          <NuxtLink :to="item.href" class="hover:underline" :aria-label="titleAria">
            {{ item.title }}
          </NuxtLink>
        </h3>

        <p v-if="item.caption" class="mb-3 line-clamp-3 text-white/90">
          {{ item.caption }}
        </p>

        <NuxtLink
          :to="item.href"
          :class="ctaClass"
          :aria-label="ctaAria"
        >
          {{ ctaLabel }}
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
