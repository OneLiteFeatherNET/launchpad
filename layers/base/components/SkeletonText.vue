<script setup lang="ts">
import SkeletonBlock from './SkeletonBlock.vue'

/** Lines of placeholder text; the last one is shorter, as a paragraph's is. */
const { lines = 1, lineClass = 'h-4' } = defineProps<{
  lines?: number
  /** Height (and any width override) of one line. */
  lineClass?: string
}>()
</script>

<template>
  <div class="space-y-2">
    <SkeletonBlock
      v-for="line in lines"
      :key="line"
      :class="[lineClass, line === lines && lines > 1 ? 'w-2/3' : 'w-full']"
      shape="small"
    />
  </div>
</template>
