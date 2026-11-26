<script setup lang="ts">
import { ARTICLE_HEADER_SIZES } from '../utils/articleImage'

// The article's header image is its LCP element. It is preloaded, fetched with
// high priority and never lazy; NuxtPicture derives the preload's
// imagesrcset/imagesizes from the same source it renders, so the two cannot
// disagree. The page renders this only when the article has an image, so an
// article without one emits no preload either.
defineProps<{
  src: string
  alt: string
}>()
</script>

<template>
  <NuxtPicture
    :src="src"
    :alt="alt"
    :sizes="ARTICLE_HEADER_SIZES"
    width="1920"
    height="1080"
    fit="cover"
    quality="80"
    format="avif,webp"
    loading="eager"
    :preload="{ fetchPriority: 'high' }"
    :img-attrs="{ class: 'aspect-video object-cover w-full', fetchpriority: 'high' }"
  />
</template>
