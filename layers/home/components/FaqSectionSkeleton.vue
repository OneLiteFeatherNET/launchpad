<script setup lang="ts">
/** The FAQ section while the questions load: heading, subtitle and a few closed rows. */
</script>

<template>
  <SkeletonRegion class="mx-auto max-w-4xl px-4 py-10 md:py-14">
    <div class="mb-6 flex flex-col items-center gap-2">
      <SkeletonBlock class="h-9 w-1/3" shape="small" />
      <SkeletonBlock class="h-6 w-1/2" shape="small" />
    </div>
    <div class="space-y-3">
      <SkeletonBlock v-for="n in 4" :key="n" class="h-14 w-full" shape="medium" />
    </div>
  </SkeletonRegion>
</template>
