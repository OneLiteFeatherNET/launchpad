<script setup lang="ts">
/**
 * The project page while its data loads: back link, 96px logo with badges,
 * title, summary and text in the finished page's spacing.
 */
</script>

<template>
  <SkeletonRegion class="min-h-screen space-y-8">
    <div class="space-y-4">
      <SkeletonBlock class="h-5 w-32" shape="small" />
      <div class="flex items-center gap-4">
        <SkeletonBlock class="size-24 shrink-0" shape="large" />
        <SkeletonBlock class="h-8 w-24" shape="small" />
        <SkeletonBlock class="h-8 w-24" shape="small" />
      </div>
      <SkeletonBlock class="h-11 w-2/3" shape="small" />
      <SkeletonText :lines="2" line-class="h-6" />
    </div>
    <SkeletonText :lines="5" line-class="h-6" />
  </SkeletonRegion>
</template>
