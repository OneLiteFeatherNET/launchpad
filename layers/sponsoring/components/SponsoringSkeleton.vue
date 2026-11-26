<script setup lang="ts">
/** The sponsoring section while the sponsors load: centred heading and the two panels. */
</script>

<template>
  <SkeletonRegion class="relative isolate w-full">
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="mb-8 flex flex-col items-center gap-2">
        <SkeletonBlock class="h-9 w-1/2" shape="small" />
        <SkeletonBlock class="h-6 w-2/3" shape="small" />
      </div>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-stretch">
        <SkeletonBlock class="h-80" shape="large" />
        <SkeletonBlock class="h-80" shape="large" />
      </div>
    </div>
  </SkeletonRegion>
</template>
