<script setup lang="ts">
// Small FontAwesome wrapper that forwards attributes and classes
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconName } from '../types';
const props = defineProps<{
  icon: IconName;
}>();

const attrs = useAttrs();
</script>

<template>
  <!-- Accepts either a string like 'home' or an array like ['fas','home'] -->
  <FontAwesomeIcon :icon="props.icon" v-bind="attrs" />
</template>
