<script setup lang="ts">
/**
 * The about page's sections while the document loads. The community strip sits
 * between them and is not part of the document, so the page places this
 * twice: `intro` for the first two sections, `outro` for the last two.
 */
const { part = 'intro' } = defineProps<{ part?: 'intro' | 'outro' }>()
</script>

<template>
  <SkeletonRegion v-if="part === 'intro'">
    <section>
      <SkeletonBlock class="h-9 w-48" shape="small" />
      <SkeletonText class="mt-3 max-w-3xl" :lines="3" line-class="h-6" />
    </section>
    <section class="mt-12">
      <SkeletonBlock class="mb-5 h-9 w-56" shape="small" />
      <ul class="grid gap-4 sm:grid-cols-2">
        <li v-for="n in 4" :key="n">
          <SkeletonBlock class="h-48" shape="large" />
        </li>
      </ul>
    </section>
  </SkeletonRegion>
  <SkeletonRegion v-else>
    <section class="mt-4">
      <SkeletonBlock class="h-9 w-48" shape="small" />
      <SkeletonText class="mt-3 max-w-3xl" :lines="3" line-class="h-6" />
    </section>
    <section class="mt-12">
      <SkeletonBlock class="h-9 w-40" shape="small" />
      <SkeletonText class="mt-3 mb-5 max-w-3xl" :lines="2" line-class="h-6" />
      <SkeletonBlock class="h-24" shape="large" />
    </section>
  </SkeletonRegion>
</template>
