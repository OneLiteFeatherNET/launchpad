<script setup lang="ts">
/** The POI grid while the list loads: same columns and gaps, 16:9 card media. */
</script>

<template>
  <SkeletonRegion>
    <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="n in 6" :key="n" class="relative">
        <M3Card as="div" variant="outlined" class="h-full">
          <template #media>
            <SkeletonImage aspect="aspect-[16/9]" />
          </template>
          <div class="flex flex-1 flex-col gap-3">
            <SkeletonBlock class="h-7 w-3/4" shape="small" />
            <SkeletonText :lines="3" line-class="h-5" />
            <SkeletonBlock class="h-2 w-full" shape="full" />
          </div>
        </M3Card>
      </li>
    </ul>
  </SkeletonRegion>
</template>
