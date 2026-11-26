<script setup lang="ts">
import { CAROUSEL_FRAME } from '../utils/carouselClasses'

/**
 * The home carousel while its slides load: the carousel's own frame at its
 * 16:9 ratio and minimum height, so the slides replace it without a shift.
 */
</script>

<template>
  <SkeletonRegion class="w-full">
    <div class="relative">
      <div
        data-carousel-skeleton-frame
        :class="CAROUSEL_FRAME"
        style="padding-top: 56.25%"
      >
        <SkeletonBlock class="absolute inset-0" shape="none" />
      </div>
    </div>
  </SkeletonRegion>
</template>
