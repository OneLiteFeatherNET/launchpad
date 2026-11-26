<script setup lang="ts">
/**
 * The team roster while it loads: one rank heading and the member cards in
 * the 18rem width the real cards have, wrapping the same way.
 */
</script>

<template>
  <SkeletonRegion>
    <SkeletonBlock class="h-9 w-48" shape="small" />
    <ul class="mt-5 flex flex-wrap gap-4">
      <li v-for="n in 6" :key="n" class="w-72 shrink-0">
        <M3Card as="div" variant="outlined" class="h-full">
          <div class="flex items-center gap-4">
            <SkeletonBlock class="size-16 shrink-0" shape="medium" />
            <SkeletonBlock class="h-7 w-32" shape="small" />
          </div>
          <div class="mt-3 flex gap-2">
            <SkeletonBlock class="h-8 w-20" shape="small" />
          </div>
          <SkeletonText class="mt-3" :lines="2" line-class="h-5" />
        </M3Card>
      </li>
    </ul>
  </SkeletonRegion>
</template>
