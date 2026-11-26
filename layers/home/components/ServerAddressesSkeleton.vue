<script setup lang="ts">
/**
 * The "how to join" section while its addresses load: heading, subtitle and
 * the two address cards in the panel of the finished section.
 */
</script>

<template>
  <SkeletonRegion class="relative isolate w-full overflow-hidden">
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <div
        class="relative mx-auto w-full max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3rem)]
          lg:max-w-3xl"
      >
        <div
          class="w-full rounded-extra-large bg-surface-container-low p-6 md:mx-0 md:max-w-full
            md:p-10 lg:mx-[-2.5%] lg:max-w-[105%]"
        >
          <div class="mb-6 flex flex-col items-center gap-2 md:mb-8">
            <SkeletonBlock class="h-9 w-2/3" shape="small" />
            <SkeletonBlock class="h-6 w-1/2" shape="small" />
          </div>
          <div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6">
            <SkeletonBlock class="h-40" shape="large" />
            <SkeletonBlock class="h-40" shape="large" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonRegion>
</template>
