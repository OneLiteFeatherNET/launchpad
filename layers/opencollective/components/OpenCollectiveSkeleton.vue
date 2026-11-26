<script setup lang="ts">
/** The OpenCollective section while its numbers load: centred heading and three stat cards. */
</script>

<template>
  <SkeletonRegion class="relative isolate w-full">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
      <div class="mb-6 flex flex-col items-center gap-2 sm:mb-8">
        <SkeletonBlock class="h-9 w-1/2" shape="small" />
        <SkeletonBlock class="h-6 w-2/3" shape="small" />
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <SkeletonBlock v-for="n in 3" :key="n" class="h-44" shape="large" />
      </div>
    </div>
  </SkeletonRegion>
</template>
