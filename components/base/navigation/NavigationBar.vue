<script setup lang="ts">
import { ref } from '#imports';
import NavigationSimpleButton from "~/components/base/navigation/NavigationSimpleButton.vue";
import NavigationLanguageSelector from "~/components/base/navigation/NavigationLanguageSelector.vue";
const locale = useCookieLocale();
const localePath = useLocalePath()


const navItems = [
  { textKey: 'navigation.overview', path: localePath('index', locale?.value as Locale) },
];

const mobileMenuOpen = ref(false);
</script>

<template>
  <header class="bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NuxtLinkLocale to="/" class="flex-shrink-0 flex items-center">
            <NuxtImg src="images/logo.svg"
                     alt="OneLiteFeather Logo"
                     width="60"
                     height="60"
                     class="h-15 w-15 rounded-full"
                     format="webp">
            </NuxtImg>
            <span class="text-xl font-medium dark:text-white ">OneLiteFeather</span>
          </NuxtLinkLocale>
        </div>
        <nav class="hidden md:flex items-center space-x-1">
          <NavigationSimpleButton
              v-for="item in navItems"
              :text-key="item.textKey"
              :path="item.path" />
          <NavigationLanguageSelector />
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
        <NavigationSimpleButton
            v-for="item in navItems"
            :text-key="item.textKey"
            :path="item.path"
            :mobile="true"
            @clickMobile="mobileMenuOpen = false"/>
        <div class="py-2">
          <NavigationLanguageSelector :mobile="true" />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>