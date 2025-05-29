<script setup lang="ts">
import {useI18n} from "#imports";
import { ref } from 'vue';
const { locale, locales } = useI18n();
const props = defineProps<{
  mobile?: boolean;
}>();
const changeLocale = (newLocale: Event) => {
  const target = newLocale.target as HTMLSelectElement;
  locale.value = <"en" | "de">target.value;
};

const isOpen = ref(false);

// Schließe das Dropdown-Menü, wenn außerhalb geklickt wird
const dropdown = ref(null);
/*onClickOutside(dropdown, () => {
  isOpen.value = false;
});*/
</script>

<template>
  <div ref="dropdown" class="relative">
    <!-- Desktop Version -->
    <button
        v-if="!props.mobile"
        @click="isOpen = !isOpen"
        class="flex items-center ml-4 bg-white dark:text-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <span>{{ locales.find(l => l.code === locale)?.name }}</span>
      <svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Mobile Version -->
    <button
        v-else
        @click="isOpen = !isOpen"
        class="flex items-center justify-between w-full bg-white dark:text-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-xl text-base transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <span>{{ locales.find(l => l.code === locale)?.name }}</span>
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Dropdown Menu (für beide Versionen) -->
    <div
        v-show="isOpen"
        class="absolute z-30 mt-2 overflow-hidden origin-top-right bg-white  dark:text-white dark:bg-gray-800 rounded-xl shadow-lg transition-all transform"
        :class="props.mobile ? 'left-0 right-0' : 'right-0 w-48'"
    >
      <div class="py-1">
        <button
            v-for="loc in locales"
            :key="loc.code"
            class="w-full text-left px-4 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            :class="{'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': locale === loc.code}"
            @click="locale = loc.code; isOpen = false"
        >
          {{ loc.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>