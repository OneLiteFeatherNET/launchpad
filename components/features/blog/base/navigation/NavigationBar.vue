<script setup lang="ts">
import { ref } from '#imports';
import SimpleNavButton from "~/components/base/buttons/SimpleNavButton.vue";
import NavigationLanguageSelector from "./NavigationLanguageSelector.vue";
const { t } = useI18n();
const locale = useCookieLocale();
const localePath = useLocalePath();


const navItems = [
  { textKey: 'navigation.overview', path: localePath('index', locale?.value as 'de' | 'en' | undefined) },
];

const mobileMenuOpen = ref(false);
</script>

<template>
  <header class="bg-white/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NuxtLinkLocale to="/" class="flex-shrink-0 flex items-center">
            <NuxtImg src="images/logo.svg"
                     :alt="t('accessibility.logo_alt')"
                     width="60"
                     height="60"
                     class="h-15 w-15 rounded-full"
                     format="webp">
            </NuxtImg>
            <span class="text-xl font-medium text-gray-900 dark:text-white">OneLiteFeather</span>
          </NuxtLinkLocale>
        </div>
        <nav class="hidden md:flex items-center space-x-1">
          <SimpleNavButton
              v-for="item in navItems"
              :text-key="item.textKey"
              :path="item.path" />
          <NavigationLanguageSelector />
        </nav>
        <div class="md:hidden flex items-center">
          <button
              id="mobile-menu-button"
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :aria-label="t('navigation.toggle_mobile_menu')"
              :aria-expanded="mobileMenuOpen"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="md:hidden" v-show="mobileMenuOpen" role="menu" aria-labelledby="mobile-menu-button">
      <div class="pt-2 pb-4 space-y-1 px-4">
        <SimpleNavButton
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
