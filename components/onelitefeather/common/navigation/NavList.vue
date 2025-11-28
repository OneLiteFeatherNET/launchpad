<script setup lang="ts">
import NavigationItem from './NavigationItem.vue';

const props = defineProps<{
  items: Array<{ textKey: string; path: string; icon?: string | [string,string] }>;
  variant?: 'desktop' | 'mobile' | 'bottom';
}>();

const variant = props.variant ?? 'desktop';
</script>

<template>
  <div v-if="variant === 'desktop'" class="flex items-center gap-2">
    <NavigationItem v-for="item in items" :key="item.path" :text-key="item.textKey" :path="item.path" :icon="item.icon" />
  </div>
  <div v-else class="flex flex-col">
    <NavigationItem v-for="item in items" :key="item.path" :text-key="item.textKey" :path="item.path" :icon="item.icon" :variant="variant" />
  </div>
</template>
