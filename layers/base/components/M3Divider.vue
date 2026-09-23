<script setup lang="ts">
import { M3_DIVIDER } from '../utils/m3Variants'

/**
 * MD3 divider. An <hr>, so assistive technology announces a separator; with
 * `decorative` it is a purely visual line that is skipped.
 */
withDefaults(defineProps<{
  decorative?: boolean
}>(), {
  decorative: false,
})
</script>

<template>
  <div v-if="decorative" aria-hidden="true" :class="M3_DIVIDER" />
  <hr v-else :class="M3_DIVIDER">
</template>
