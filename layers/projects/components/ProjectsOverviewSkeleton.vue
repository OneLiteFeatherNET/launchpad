<script setup lang="ts">
/**
 * The projects overview while the list loads: the filter bar, one audience
 * heading and a grid of cards in the finished page's spacing.
 */
</script>

<template>
  <SkeletonRegion class="space-y-12">
    <SkeletonBlock class="h-14 w-full" shape="large" />
    <section class="space-y-6">
      <div class="max-w-3xl space-y-2">
        <SkeletonBlock class="h-9 w-1/2" shape="small" />
        <SkeletonBlock class="h-6 w-full" shape="small" />
      </div>
      <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="n in 6" :key="n" class="relative">
          <M3Card as="div" variant="outlined" class="h-full">
            <div class="flex flex-1 flex-col gap-3">
              <div class="flex items-start justify-between gap-3">
                <SkeletonBlock class="size-16 shrink-0" shape="medium" />
                <SkeletonBlock class="h-8 w-24" shape="small" />
              </div>
              <SkeletonBlock class="h-7 w-3/4" shape="small" />
              <SkeletonText :lines="3" line-class="h-5" />
            </div>
          </M3Card>
        </li>
      </ul>
    </section>
  </SkeletonRegion>
</template>
