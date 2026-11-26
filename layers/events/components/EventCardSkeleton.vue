<script setup lang="ts">
/** An EventCard while the list loads: same card, 16:9 media, chips and text rows. */
</script>

<template>
  <M3Card as="li" variant="elevated">
    <template #media>
      <SkeletonImage aspect="aspect-video" />
    </template>
    <SkeletonBlock class="h-6 w-3/4" shape="small" />
    <div class="mt-2 flex flex-wrap gap-2">
      <SkeletonBlock class="h-8 w-20" shape="small" />
      <SkeletonBlock class="h-8 w-24" shape="small" />
    </div>
    <SkeletonBlock class="mt-2 h-5 w-full" shape="small" />
    <SkeletonBlock class="mt-auto h-5 w-1/2" shape="small" />
  </M3Card>
</template>
