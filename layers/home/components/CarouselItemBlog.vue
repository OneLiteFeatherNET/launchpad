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
import {computed} from 'vue'

// `locale` because these format with explicit option objects that vue-i18n's
// `d()` cannot express without named datetimeFormats entries — so the call
// stays, and only the language stops being fixed.
const { t, locale } = useI18n()

interface BlogItem {
  type: 'blog'
  title: string
  href: string
  excerpt?: string
  image?: string
  alt?: string
  author?: string
  date?: string | Date
  tag?: string
}

const props = withDefaults(defineProps<{ item: BlogItem; priority?: boolean }>(), {
  priority: false
})

const dateLabel = computed(() => {
  const d = props.item.date ? new Date(props.item.date) : null
  if (!d || Number.isNaN(d.getTime())) return undefined
  try {
    return d.toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return d.toISOString().slice(0, 10)
  }
})
</script>

<template>
  <article class="absolute inset-0 h-full w-full">
    <NuxtPicture
      :src="item.image"
      :alt="item.alt || item.title"
      sizes="sm:100vw md:100vw lg:1280px"
      densities="1x 2x"
      quality="75"
      :placeholder="false"
      format="avif,webp"
      :loading="props.priority ? 'eager' : 'lazy'"
      :preload="props.priority"
      :img-attrs="{
        class: 'absolute inset-0 h-full w-full object-cover',
        fetchpriority: props.priority ? 'high' : undefined
      }"
    />

    <!-- Gradient overlay for readability -->
    <div :class="CAROUSEL_SCRIM" />

    <!-- Content card: add extra bottom padding so it doesn't overlap with the carousel dots/indicators -->
    <div :class="CAROUSEL_CAPTION_POSITION">
      <div :class="CAROUSEL_CAPTION">
        <div :class="CAROUSEL_META">
          <M3Chip v-if="item.tag" kind="label" color="secondary" :label="item.tag" />
          <span v-if="dateLabel">{{ dateLabel }}</span>
          <span v-if="item.author" class="truncate">von {{ item.author }}</span>
        </div>

        <h3 :class="CAROUSEL_TITLE">
          <NuxtLink
            :to="item.href"
            :class="CAROUSEL_TITLE_LINK"
            :aria-label="t('carousel.blog_link', { title: item.title })"
          >
            {{ item.title }}
          </NuxtLink>
        </h3>

        <p v-if="item.excerpt" :class="CAROUSEL_TEXT">
          {{ item.excerpt }}
        </p>

        <M3Button
          variant="tonal"
          :to="item.href"
          :aria-label="t('carousel.read_article', { title: item.title })"
        >
          Lesen
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" aria-hidden="true" />
        </M3Button>
      </div>
    </div>
  </article>
</template>
