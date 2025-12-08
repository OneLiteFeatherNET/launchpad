<script setup lang="ts">
import { ref, computed } from '#imports';
import NavigationItem from './NavigationItem.vue'
import NavigationDropdown from './NavigationDropdown.vue'
import LanguageSelector from './LanguageSelector.vue'
import NavigationIconButton from '~/components/base/buttons/NavigationIconButton.vue'
import GradientText from '~/components/base/typography/GradientText.vue'
import IconFa from '~/components/base/icons/IconFa.vue'

const { t, locale } = useI18n();
const runtimeConfig = useRuntimeConfig();

const props = defineProps<{
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  variant?: 'top' | 'bottom';
}>();

const elevation = props.elevation ?? 2;
const variant = props.variant ?? 'top';

const mobileMenuOpen = ref(false);
const mobileMenuId = 'mobile-menu-panel';
// Verwende die reaktive i18n-Locale; localePath nutzt automatisch die aktuelle Sprache
const localePath = useLocalePath();
const discordUrl = (runtimeConfig.public?.discordUrl as string | undefined) || (process?.env?.NUXT_PUBLIC_DISCORD_URL as string | undefined);

type NavItem = {
  type: 'item'
  textKey: string
  path: string
  icon?: string | [string, string]
}

type NavGroup = {
  type: 'group'
  textKey: string
  icon?: string | [string, string]
  children: Array<{ textKey: string; path: string; icon?: string | [string, string] }>
}

type NavEntry = NavItem | NavGroup

// Navigationspfade basieren auf der aktuellen (reaktiven) Sprache
const navItems = computed<NavEntry[]>(() => {
  // Abhängigkeit zu locale.value herstellen, damit Reaktivität gewährleistet ist
  const _ = locale.value; // eslint-disable-line @typescript-eslint/no-unused-vars
  return [
    { type: 'item', textKey: 'navigation.overview', path: localePath('index'), icon: ['fas','home'] },
    { type: 'item', textKey: 'navigation.server', path: (localePath('index') + '#connect'), icon: ['fas','server'] },
    { type: 'item', textKey: 'navigation.bluemap', path: localePath('bluemap'), icon: ['fas','map'] },
    { type: 'item', textKey: 'navigation.blog', path: localePath('blog'), icon: ['fas','file-alt'] },
    {
      type: 'group',
      textKey: 'navigation.more',
      icon: ['fas','ellipsis-h'],
      children: [
        { textKey: 'navigation.status', path: 'https://status.onelitefeather.net', icon: ['fas','signal'] },
        { textKey: 'navigation.roadmap', path: '#', icon: ['fas','list-ul'] }
      ]
    }
  ];
});

const allNavItems = computed<NavEntry[]>(() => [
  ...navItems.value,
  ...(discordUrl ? [{ type: 'item', textKey: 'navigation.discord', path: discordUrl, icon: ['fab','discord'] } as NavItem] : [])
]);

const elevationClasses = {
  0: 'shadow-none',
  1: 'shadow-sm',
  2: 'shadow-md',
  3: 'shadow-lg',
  4: 'shadow-xl',
  5: 'shadow-2xl'
};
</script>

<template>
  <!-- Top Navigation for desktop/tablet -->
  <header v-if="variant === 'top'" :class="['sticky top-0 z-50 w-full bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/95 backdrop-blur', elevationClasses[elevation]]" @keydown.escape.window="mobileMenuOpen = false">
    <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8" role="navigation" :aria-label="t('navigation.main')">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <NuxtLinkLocale to="/" :aria-label="t('navigation.overview')" class="flex items-center gap-2 text-[var(--color-text)] no-underline hover:opacity-90 dark:text-[var(--color-text)]">
            <NuxtImg src="images/logo.svg" :alt="t('accessibility.logo_alt')" width="40" height="40" class="h-10 w-10" format="webp" />
            <GradientText variant="accent" tone="light" class="text-lg font-semibold">OneLiteFeather</GradientText>
          </NuxtLinkLocale>
        </div>

        <nav class="hidden items-center gap-2 lg:flex" role="navigation" :aria-label="t('navigation.main')">
          <template v-for="item in allNavItems" :key="item.type === 'item' ? item.path : item.textKey">
            <NavigationItem
              v-if="item.type === 'item'"
              :text-key="item.textKey"
              :path="item.path"
              :icon="item.icon"
            />
            <NavigationDropdown
              v-else
              :text-key="item.textKey"
              :icon="item.icon"
              :children="item.children"
            />
          </template>
          <LanguageSelector />
        </nav>

        <div class="lg:hidden">
          <NavigationIconButton
            :icon="mobileMenuOpen ? ['fas','times'] : ['fas','bars']"
            :aria-label="t('navigation.toggle_mobile_menu')"
            :aria-controls="mobileMenuId"
            :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          />
        </div>
      </div>
    </div>

    <!-- Mobile menu overlay -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        aria-hidden="false"
        @click.self="mobileMenuOpen = false"
      >
        <nav
          :id="mobileMenuId"
          class="absolute left-0 right-0 top-0 z-50 mx-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
          role="navigation"
          :aria-label="t('navigation.mobile')"
        >
          <template v-for="item in allNavItems" :key="item.type === 'item' ? item.path : item.textKey">
            <NavigationItem
              v-if="item.type === 'item'"
              :text-key="item.textKey"
              :path="item.path"
              :icon="item.icon"
              variant="mobile"
              @click="mobileMenuOpen = false"
            />
            <details v-else class="rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]/70 p-2 mb-2">
              <summary class="flex items-center gap-2 px-2 py-1 text-[var(--color-text)] cursor-pointer select-none">
                <IconFa v-if="item.icon" :icon="item.icon" class="h-4 w-4" />
                <span class="text-sm font-medium">{{ t(item.textKey) }}</span>
              </summary>
              <div class="mt-2 space-y-1">
                <NavigationItem
                  v-for="child in item.children"
                  :key="child.path"
                  :text-key="child.textKey"
                  :path="child.path"
                  :icon="child.icon"
                  variant="mobile"
                  @click="mobileMenuOpen = false"
                />
              </div>
            </details>
          </template>
          <div class="my-2 border-t border-[var(--color-border)] pt-2 dark:border-[var(--color-border)]">
            <LanguageSelector variant="mobile" @selected="mobileMenuOpen = false" />
          </div>
        </nav>
      </div>
    </Transition>
  </header>

  <!-- Bottom navigation for mobile -->
  <nav v-else :class="['fixed bottom-0 inset-x-0 z-50 bg-[var(--color-surface)] dark:bg-[var(--color-surface)]', elevationClasses[elevation]]" role="navigation" :aria-label="t('navigation.bottom')">
    <div class="grid [grid-template-columns:repeat(auto-fit,minmax(5rem,1fr))] gap-1 p-2 lg:hidden">
      <NavigationItem
        v-for="item in allNavItems"
        v-if="item.type === 'item'"
        :key="item.path"
        :text-key="item.textKey"
        :path="item.path"
        :icon="item.icon"
        variant="bottom"
      />
    </div>
  </nav>
</template>
