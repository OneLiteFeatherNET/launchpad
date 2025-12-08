<script setup lang="ts">
import { ref, computed, nextTick, navigateTo, onMounted, onBeforeUnmount } from '#imports';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faLanguage, faChevronDown } from '@fortawesome/free-solid-svg-icons'
const { t } = useI18n();

const props = defineProps<{
  variant?: 'desktop' | 'mobile';
}>();

const variant = props.variant ?? 'desktop';
const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const isOpen = ref(false);
const buttonRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const initialFocus = ref<'first' | 'last'>('first');
const buttonId = computed(() => `lang-button-${variant}`);
const dropdownId = computed(() => `lang-menu-${variant}`);

const availableLocales = computed(() => locales.value.filter((i: any) => i.code !== locale.value));
const currentLocale = computed(() => locales.value.find((i: any) => i.code === locale.value));

const focusMenuItem = (position: 'first' | 'last' | number = 'first') => {
  const container = menuRef.value;
  if (!container) return;
  const items = Array.from(container.querySelectorAll('a, [role="menuitem"], button')) as HTMLElement[];
  if (items.length === 0) return;
  if (position === 'first') items[0].focus();
  else if (position === 'last') items[items.length - 1].focus();
  else if (typeof position === 'number' && items[position]) items[position].focus();
};

const openDropdown = async (focus: 'first' | 'last' = 'first') => {
  initialFocus.value = focus;
  isOpen.value = true;
  await nextTick();
  focusMenuItem(focus);
};

const closeDropdown = (returnFocus = true) => {
  isOpen.value = false;
  if (returnFocus) nextTick(() => buttonRef.value?.focus());
};

const toggleDropdown = async () => {
  if (isOpen.value) closeDropdown(true);
  else await openDropdown('first');
};

const onButtonKeydown = async (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); await openDropdown('first'); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); await openDropdown('last'); }
  else if (e.key === 'Escape') { e.preventDefault(); closeDropdown(true); }
};

const onMenuKeydown = (e: KeyboardEvent) => {
  const container = menuRef.value;
  if (!container) return;
  const items = Array.from(container.querySelectorAll('a, [role="menuitem"], button')) as HTMLElement[];
  const currentIndex = items.findIndex(el => el === document.activeElement);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (items.length) items[(currentIndex + 1) % items.length].focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (items.length) items[(currentIndex - 1 + items.length) % items.length].focus();
      break;
    case 'Home':
      e.preventDefault();
      focusMenuItem('first');
      break;
    case 'End':
      e.preventDefault();
      focusMenuItem('last');
      break;
    case 'Escape':
      e.preventDefault();
      closeDropdown(true);
      break;
    case 'Tab':
      // Close menu on Tab to follow typical menu behavior
      closeDropdown(false);
      break;
  }
};

// Close dropdown when clicking outside (desktop variant)
const onDocumentClick = (e: MouseEvent) => {
  if (!isOpen.value) return;
  const target = e.target as Node | null;
  const btn = buttonRef.value;
  const menu = menuRef.value;
  if (btn && btn.contains(target)) return;
  if (menu && menu.contains(target)) return;
  closeDropdown(false);
};

onMounted(() => {
  if (variant === 'desktop') {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('touchstart', onDocumentClick, { passive: true as any });
  }
});

onBeforeUnmount(() => {
  if (variant === 'desktop') {
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('touchstart', onDocumentClick as any);
  }
});

// Inform parent (e.g., mobile overlay) when a language was selected
const emit = defineEmits<{ (e: 'selected', locale: string): void }>();

const selectLocale = async (localeCode: string) => {
  // Sprache setzen und dann ausdrücklich zur sprachspezifischen Route navigieren,
  // damit die URL korrekt aktualisiert wird und serverseitige Navigation greift.
  await setLocale(localeCode as 'de' | 'en');
  const targetPath = switchLocalePath(localeCode);
  if (targetPath) {
    await navigateTo(targetPath);
  }
  emit('selected', localeCode);
  closeDropdown(true);
};
</script>

<template>
  <div v-if="variant === 'desktop'" class="relative" @keydown.escape.window="closeDropdown(true)">
    <button
      @click="toggleDropdown"
      :aria-label="t('navigation.change_language')"
      :id="buttonId"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="dropdownId"
      ref="buttonRef"
      @keydown="onButtonKeydown"
      class="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
    >
      <FontAwesomeIcon :icon="faLanguage" class="text-lg" />
      <span class="uppercase">{{ currentLocale?.code }}</span>
      <FontAwesomeIcon :icon="faChevronDown" class="text-sm transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        :id="dropdownId"
        role="menu"
        :aria-labelledby="buttonId"
        tabindex="-1"
        ref="menuRef"
        @keydown="onMenuKeydown"
        class="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black/5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
      >
        <NuxtLink
          v-for="loc in availableLocales"
          :key="loc.code"
          :to="switchLocalePath(loc.code)"
          role="menuitem"
          class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[var(--color-text)]/70 transition-colors hover:bg-[var(--color-secondary)]/10 dark:text-[var(--color-text)]/85 dark:hover:bg-[var(--color-secondary)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
          @click.prevent="selectLocale(loc.code)"
        >
          <span class="uppercase font-semibold text-[var(--color-secondary)]">{{ loc.code }}</span>
          <span>{{ loc.name }}</span>
        </NuxtLink>
      </div>
    </Transition>
  </div>

  <div v-else class="flex flex-col" @keydown.escape.window="isOpen = false">
    <div class="flex items-center gap-3 px-4 py-3 text-base font-medium text-[var(--color-text)]/70 dark:text-[var(--color-text)]/85">
      <FontAwesomeIcon :icon="faLanguage" class="text-xl" />
      {{ t('navigation.change_language') }}
    </div>
    <NuxtLink
      v-for="loc in availableLocales"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      class="ml-4 flex items-center gap-3 rounded-xl px-6 py-2 text-sm font-medium text-[var(--color-text)]/70 transition-colors hover:bg-[var(--color-secondary)]/10 dark:text-[var(--color-text)]/85 dark:hover:bg-[var(--color-secondary)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
      @click.prevent="selectLocale(loc.code)"
    >
      <span class="uppercase font-semibold text-[var(--color-secondary)]">{{ loc.code }}</span>
      <span>{{ loc.name }}</span>
    </NuxtLink>
  </div>
</template>
