<script setup lang="ts">
import {useI18n} from "#imports";
import { ref } from 'vue';
const { locale, locales } = useI18n();
const props = defineProps<{
  mobile?: boolean;
}>();
const switchLocalePath = useSwitchLocalePath()
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
        class="flex items-center ml-4 bg-white text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        aria-haspopup="true"
        :aria-expanded="isOpen"
        aria-label="Select language"
        id="language-menu-button"
    >
      <span>{{ locales.find(l => l.code === locale)?.name }}</span>
      <svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Mobile Version -->
    <button
        v-else
        @click="isOpen = !isOpen"
        class="flex items-center justify-between w-full bg-white text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-full text-base transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        aria-haspopup="true"
        :aria-expanded="isOpen"
        aria-label="Select language"
        id="mobile-language-menu-button"
    >
      <span>{{ locales.find(l => l.code === locale)?.name }}</span>
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <div
        v-show="isOpen"
        class="absolute z-30 mt-2 overflow-hidden origin-top-right bg-white text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl shadow-xxl transition-all transform"
        :class="props.mobile ? 'left-0 right-0' : 'right-0 w-48'"
        role="menu"
        :aria-labelledby="props.mobile ? 'mobile-language-menu-button' : 'language-menu-button'"
        @keydown.esc="isOpen = false"
    >
      <div class="py-1">
        <NuxtLink
            v-for="loc in locales"
            :key="loc.code"
            class="w-full text-left px-4 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 block"
            :class="{'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-300 shadow-sm block': locale === loc.code}"
            :to="switchLocalePath(loc.code)"
            @click="isOpen = false"
            role="menuitem"
            :aria-current="locale === loc.code ? 'true' : undefined"
            tabindex="0"
        >
          {{ loc.name }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
