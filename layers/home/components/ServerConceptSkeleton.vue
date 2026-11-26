<script setup lang="ts">
/** The server concept section while it loads: centred heading and three cards. */
</script>

<template>
  <SkeletonRegion class="relative isolate w-full">
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="mb-8 flex flex-col items-center gap-2">
        <SkeletonBlock class="h-9 w-1/2" shape="small" />
        <SkeletonBlock class="h-6 w-2/3" shape="small" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <M3Card v-for="n in 3" :key="n" as="div" variant="elevated" class="h-full">
          <div class="mb-3 flex items-center gap-3">
            <SkeletonBlock class="size-5 shrink-0" shape="small" />
            <SkeletonBlock class="h-7 w-2/3" shape="small" />
          </div>
          <SkeletonText :lines="3" line-class="h-6" />
        </M3Card>
      </div>
    </div>
  </SkeletonRegion>
</template>
