<script setup lang="ts">
/**
 * The event page while its data loads. Same container spacing and header
 * order as the finished page: back link, 16:9 thumbnail, chips, title,
 * summary, dates and the phase hint. Nothing below the header: the text
 * below it varies in length, and the skeleton must not outgrow a short page.
 */
</script>

<template>
  <SkeletonRegion class="space-y-8">
    <div class="space-y-4">
      <SkeletonBlock class="h-10 w-32" shape="full" />
      <SkeletonImage aspect="aspect-video" shape="large" />
      <div class="flex flex-wrap gap-2">
        <SkeletonBlock class="h-8 w-20" shape="small" />
        <SkeletonBlock class="h-8 w-24" shape="small" />
        <SkeletonBlock class="h-8 w-24" shape="small" />
      </div>
      <SkeletonBlock class="h-10 w-3/4" shape="small" />
      <SkeletonText :lines="2" line-class="h-6" />
      <SkeletonBlock class="h-6 w-64" shape="small" />
      <SkeletonBlock class="h-11 w-full" shape="medium" />
    </div>
  </SkeletonRegion>
</template>
