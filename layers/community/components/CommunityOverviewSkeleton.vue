<script setup lang="ts">
/**
 * The community page while its overview loads: the row of stat tiles and the
 * contributor wall's heading with a grid of contributor cards.
 */
</script>

<template>
  <SkeletonRegion>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3 md:gap-4">
      <SkeletonBlock v-for="n in 4" :key="n" class="h-20" shape="large" />
    </div>
    <div class="mt-12">
      <SkeletonBlock class="h-8 w-56" shape="small" />
      <SkeletonText class="mt-2 max-w-3xl" :lines="2" line-class="h-6" />
      <ul class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="n in 6" :key="n">
          <SkeletonBlock class="h-24" shape="large" />
        </li>
      </ul>
    </div>
  </SkeletonRegion>
</template>
