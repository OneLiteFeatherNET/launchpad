<script setup lang="ts">
import { ARTICLE_CARD_CLASS } from '../utils/articleCardClasses'

/**
 * The article page while its data loads. Mirrors the finished layout — card,
 * 16:9 header image, padding, title, date, tag row, text — so nothing moves
 * when the article replaces it.
 */
</script>

<template>
  <SkeletonRegion>
    <div :class="ARTICLE_CARD_CLASS">
      <SkeletonImage aspect="aspect-video" />
      <div class="p-6 md:p-8">
        <SkeletonBlock class="h-11 w-3/4" shape="small" />
        <SkeletonBlock class="mt-1 h-5 w-32" shape="small" />
        <div class="mt-3 flex flex-wrap gap-2">
          <SkeletonBlock class="h-8 w-20" shape="small" />
          <SkeletonBlock class="h-8 w-24" shape="small" />
        </div>
        <div class="mt-3 flex items-center gap-4">
          <SkeletonBlock class="size-10" shape="full" />
          <SkeletonBlock class="h-5 w-32" shape="small" />
        </div>
        <div class="mt-4 space-y-6 md:mt-6">
          <SkeletonText :lines="4" line-class="h-6" />
          <SkeletonText :lines="3" line-class="h-6" />
        </div>
      </div>
    </div>
  </SkeletonRegion>
</template>
