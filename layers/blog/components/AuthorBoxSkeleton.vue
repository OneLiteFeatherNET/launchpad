<script setup lang="ts">
/** The author box while the person loads: same card, 96px avatar and text rows. */
</script>

<template>
  <M3Card as="div" variant="outlined">
    <div class="flex items-start gap-4">
      <SkeletonBlock class="h-24 w-24 shrink-0" shape="full" />
      <div class="flex-1">
        <SkeletonBlock class="h-9 w-48" shape="small" />
        <SkeletonBlock class="mt-1 h-5 w-32" shape="small" />
        <SkeletonBlock class="mt-3 h-6 w-full" shape="small" />
      </div>
    </div>
  </M3Card>
</template>
