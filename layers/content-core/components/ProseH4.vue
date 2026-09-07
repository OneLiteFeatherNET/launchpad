<script setup lang="ts">
import ProseHeading from './ProseHeading.vue'

const props = defineProps<{ id?: string }>()
</script>

<template>
  <ProseHeading :id="props.id" :level="4">
    <slot />
  </ProseHeading>
</template>
