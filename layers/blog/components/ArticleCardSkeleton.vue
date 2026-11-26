<script setup lang="ts">
/** An ArticleCard while the list loads: same card, 12rem media and text rows. */
</script>

<template>
  <M3Card as="div" variant="outlined">
    <template #media>
      <SkeletonBlock class="h-48 w-full" shape="none" />
    </template>
    <SkeletonBlock class="h-7 w-5/6" shape="small" />
    <SkeletonBlock class="mt-1 h-4 w-24" shape="small" />
    <SkeletonBlock class="mt-3 h-5 w-full" shape="small" />
    <SkeletonBlock class="mt-1 h-5 w-2/3" shape="small" />
  </M3Card>
</template>
