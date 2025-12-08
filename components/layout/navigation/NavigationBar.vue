<script setup lang="ts">
import { ref, computed } from '#imports';
import NavigationItem from './NavigationItem.vue'
import LanguageSelector from './LanguageSelector.vue'
import NavigationIconButton from '~/components/base/buttons/NavigationIconButton.vue'
import GradientText from '~/components/base/typography/GradientText.vue'
import IconFa from '~/components/base/icons/IconFa.vue'
import { navConfig, type NavConfigEntry, type NavLinkConfig, type NavGroupConfig } from './navItems'

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

type BuiltLink = NavLinkConfig & { path: string }
type BuiltGroup = NavGroupConfig & { children: BuiltLink[] }
type NavEntry = BuiltLink | BuiltGroup

// Navigationspfade basieren auf der aktuellen (reaktiven) Sprache
const resolvePath = (link: NavLinkConfig): string => {
  if (link.path) return link.path
  if (link.routeName) {
    const base = localePath(link.routeName as any)
    return link.hash ? `${base}${link.hash}` : base
  }
  return '#'
}

const navItems = computed<NavEntry[]>(() => {
  const _ = locale.value // keep reactivity
  return navConfig.map((entry) => {
    if (entry.type === 'group') {
      return {
        ...entry,
        children: entry.children.map(child => ({ ...child, path: resolvePath(child) }))
      } as BuiltGroup
    }
    return { ...entry, path: resolvePath(entry) } as BuiltLink
  })
})

const allNavItems = computed<NavEntry[]>(() => {
  const items: NavEntry[] = [...navItems.value]
  if (discordUrl) {
    const firstGroupIndex = items.findIndex((e) => e.type === 'group')
    const discordLink: BuiltLink = { type: 'link', textKey: 'navigation.discord', path: discordUrl, icon: ['fab', 'discord'], external: true }
    if (firstGroupIndex !== -1) {
      (items[firstGroupIndex] as BuiltGroup).children.push(discordLink)
    } else {
      items.push(discordLink)
    }
  }
  return items
})

const bottomNavLinks = computed<BuiltLink[]>(() => {
  const links: BuiltLink[] = []
  allNavItems.value.forEach((entry) => {
    if (entry.type === 'group') {
      links.push(...entry.children.map(c => ({ ...c, path: c.path })))
    } else {
      links.push(entry)
    }
  })
  return links
})

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
          <NavigationItem
            v-for="item in allNavItems"
            v-if="item.type === 'link'"
            :key="item.path"
            :text-key="item.textKey"
            :path="item.path"
            :icon="item.icon"
          />
          <div v-else class="relative" :key="item.textKey">
            <details class="group">
              <summary class="flex items-center gap-2 px-3 py-2 rounded-full text-[var(--color-text)] no-underline transition-colors hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] cursor-pointer list-none">
                <IconFa v-if="item.icon" :icon="item.icon" class="h-4 w-4" />
                <span class="text-sm font-medium">{{ t(item.textKey) }}</span>
                <IconFa :icon="['fas','chevron-down']" class="h-3 w-3" />
              </summary>
              <div class="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg ring-1 ring-black/5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] py-2 z-20">
                <NavigationItem
                  v-for="child in item.children"
                  :key="child.path"
                  :text-key="child.textKey"
                  :path="child.path"
                  :icon="child.icon"
                />
              </div>
            </details>
          </div>
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
          <NavigationItem
            v-for="item in allNavItems"
            v-if="item.type === 'link'"
            :key="item.path"
            :text-key="item.textKey"
            :path="item.path"
            :icon="item.icon"
            variant="mobile"
            @click="mobileMenuOpen = false"
          />
          <details
            v-else
            :key="item.textKey"
            class="rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]/70 p-2 mb-2"
          >
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
        v-for="item in bottomNavLinks"
        :key="item.path"
        :text-key="item.textKey"
        :path="item.path"
        :icon="item.icon"
        variant="bottom"
      />
    </div>
  </nav>
</template>
