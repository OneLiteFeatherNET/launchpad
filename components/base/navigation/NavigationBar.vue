<script setup lang="ts">
import { useI18n, useRoute, ref } from '#imports';
import type {Locale} from "@intlify/core-base";

const { locale, locales } = useI18n();

const navItems = [
  { titleKey: 'navigation.home', path: '/' },
];

const route = useRoute();

const changeLocale = (newLocale: Event) => {
  const target = newLocale.target as HTMLSelectElement;
  locale.value = target.value as Locale;
};

const mobileMenuOpen = ref(false);
</script>

<template>
  <header class="bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex-shrink-0 flex items-center">
            <span class="text-xl font-medium dark:text-white ">OneLiteFeather</span>
          </NuxtLink>
        </div>
        <nav class="hidden md:flex items-center space-x-1">
          <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-full transition-colors"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': route.path === item.path }"
          >
            {{ $t(item.titleKey) }}
          </NuxtLink>
          <select
              :value="locale"
              @change="changeLocale"
              class="ml-4 bg-gray-100 dark:bg-gray-800 border-0 rounded-full py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option v-for="loc in locales" :key="loc.code" :value="loc.code">
              {{ loc.name }}
            </option>
          </select>
        </nav>
        <div class="md:hidden flex items-center">
          <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="md:hidden" v-show="mobileMenuOpen">
      <div class="pt-2 pb-4 space-y-1 px-4">
        <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': route.path === item.path }"
            @click="mobileMenuOpen = false"
        >
          {{ $t(item.titleKey) }}
        </NuxtLink>
        <div class="py-2">
          <select
              :value="locale"
              @change="changeLocale"
              class="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-lg py-2 px-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option v-for="loc in locales" :key="loc.code" :value="loc.code">
              {{ loc.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>