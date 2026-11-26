<script setup lang="ts">
/** The featured article of the overview while it loads: same card, 24rem media. */
</script>

<template>
  <M3Card as="div" variant="outlined" class="xl:mx-80">
    <template #media>
      <SkeletonBlock class="h-96 w-full" shape="none" />
    </template>
    <SkeletonBlock class="h-8 w-3/4" shape="small" />
    <SkeletonBlock class="mt-1 h-4 w-24" shape="small" />
    <SkeletonBlock class="mt-3 h-5 w-full" shape="small" />
    <SkeletonBlock class="mt-1 h-5 w-2/3" shape="small" />
  </M3Card>
</template>
