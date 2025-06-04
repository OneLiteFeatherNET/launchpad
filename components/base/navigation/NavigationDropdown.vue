<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  textKey: string;
  items: Array<{ textKey: string; path: string }>;
  mobile?: boolean;
}>();

const emit = defineEmits(['clickMobile']);
const isOpen = ref(false);

const dropdown = ref(null);
onClickOutside(dropdown, () => {
  isOpen.value = false;
});
</script>

<template>
  <div ref="dropdown" class="relative">
    <!-- Desktop Version -->
    <button
      v-if="!props.mobile"
      @click="isOpen = !isOpen"
      class="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 text-sm font-medium rounded-full transition-colors shadow-sm text-gray-900 dark:text-gray-100"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      :aria-label="$t(props.textKey)"
    >
      <span>{{ $t(props.textKey) }}</span>
      <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Mobile Version -->
    <button
      v-else
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-full transition-colors text-gray-900 dark:text-gray-100"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      :aria-label="$t(props.textKey)"
    >
      <span>{{ $t(props.textKey) }}</span>
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <div
      v-show="isOpen"
      class="absolute z-30 mt-2 overflow-hidden origin-top-right bg-white dark:text-white dark:bg-gray-800 rounded-xl shadow-lg transition-all transform"
      :class="props.mobile ? 'left-0 right-0' : 'right-0 w-48'"
      role="menu"
      @keydown.esc="isOpen = false"
    >
      <div class="py-1">
        <NuxtLink
          v-for="item in props.items"
          :key="item.path"
          :to="item.path"
          class="block px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="isOpen = false; props.mobile && emit('clickMobile')"
          role="menuitem"
        >
          {{ $t(item.textKey) }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
