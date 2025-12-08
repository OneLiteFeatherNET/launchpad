<script setup lang="ts">
// Small FontAwesome wrapper that forwards attributes and classes
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
const props = defineProps<{
  icon: string | [string, string];
}>();

const attrs = useAttrs();
</script>

<template>
  <!-- Accepts either a string like 'home' or an array like ['fas','home'] -->
  <FontAwesomeIcon :icon="props.icon" v-bind="attrs" />
</template>
