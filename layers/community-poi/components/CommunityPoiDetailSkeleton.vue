<script setup lang="ts">
/**
 * The POI page while its data loads: back link, badges, title, summary and
 * the 16:9 hero in the finished page's spacing.
 */
</script>

<template>
  <SkeletonRegion class="space-y-8">
    <div class="space-y-4">
      <SkeletonBlock class="h-5 w-32" shape="small" />
      <div class="flex flex-wrap items-center gap-3">
        <SkeletonBlock class="h-8 w-24" shape="small" />
        <SkeletonBlock class="h-8 w-24" shape="small" />
      </div>
      <SkeletonBlock class="h-11 w-2/3" shape="small" />
      <SkeletonText :lines="2" line-class="h-6" />
    </div>
    <SkeletonImage aspect="aspect-[16/9]" shape="large" />
  </SkeletonRegion>
</template>
