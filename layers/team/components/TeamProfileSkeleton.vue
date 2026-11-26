<script setup lang="ts">
/**
 * The team profile card while the member loads: 96px avatar, name, role chips
 * and bio. The page passes the card's own classes.
 */
</script>

<template>
  <SkeletonRegion>
    <div class="flex items-start gap-5">
      <SkeletonBlock class="h-24 w-24 shrink-0" shape="large" />
      <div class="flex-1">
        <SkeletonBlock class="h-9 w-48" shape="small" />
        <div class="mt-2 flex flex-wrap gap-2">
          <SkeletonBlock class="h-8 w-24" shape="small" />
          <SkeletonBlock class="h-8 w-20" shape="small" />
        </div>
        <SkeletonBlock class="mt-2 h-6 w-2/3" shape="small" />
      </div>
    </div>
    <SkeletonText class="mt-6" :lines="3" line-class="h-6" />
  </SkeletonRegion>
</template>
