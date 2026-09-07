<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, onKeyStroke } from '#imports';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faLanguage, faChevronDown } from '@fortawesome/free-solid-svg-icons'
const { t } = useI18n();

const props = withDefaults(defineProps<{
  variant?: 'desktop' | 'mobile';
}>(), {
  variant: 'desktop'
});
const { locale, locales } = useI18n();
const isOpen = ref(false);
const buttonRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const initialFocus = ref<'first' | 'last'>('first');
const buttonId = computed(() => `lang-button-${props.variant}`);
const dropdownId = computed(() => `lang-menu-${props.variant}`);

/**
 * What this component needs from a locale entry.
 *
 * `locales` is typed `(string | LocaleObject)[]` because the shorthand form is
 * legal in nuxt.config, though this project never uses it. Describing the
 * shape here rather than importing `LocaleObject` is deliberate: the name is
 * exported by more than one package and the one from `@nuxtjs/i18n` is not the
 * member of that union, so a type predicate written against it does not narrow
 * anything (`TS2677`) and every `loc.code` stays an error.
 */
type SwitchableLocale = { code: string, name: string }

const localeObjects = computed<SwitchableLocale[]>(() => (locales.value as Array<string | { code: string, name?: string }>)
    .filter((entry): entry is { code: string, name?: string } => typeof entry !== 'string')
    .map(entry => ({ code: entry.code, name: entry.name ?? entry.code })));
const availableLocales = computed(() => localeObjects.value.filter(l => l.code !== locale.value));
const currentLocale = computed(() => localeObjects.value.find(l => l.code === locale.value));

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

onKeyStroke('Escape', () => {
  if (isOpen.value) closeDropdown(true);
});

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

// Close dropdown when clicking outside (desktop variant).
// Registered on click and on touchstart, so `Event` is the only type that
// describes what actually arrives. `e.target` is all this needs, and both
// events carry it.
const onDocumentClick = (e: Event) => {
  if (!isOpen.value) return;
  const target = e.target as Node | null;
  const btn = buttonRef.value;
  const menu = menuRef.value;
  if (btn && btn.contains(target)) return;
  if (menu && menu.contains(target)) return;
  closeDropdown(false);
};

onMounted(() => {
  if (props.variant === 'desktop') {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('touchstart', onDocumentClick, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (props.variant === 'desktop') {
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('touchstart', onDocumentClick);
  }
});

// Inform parent (e.g., mobile overlay) when a language was selected
const emit = defineEmits<{ (e: 'selected', locale: string): void }>();

// Navigation is handled by <SwitchLocalePathLink>, which resolves the
// correct localized path (including translated blog slugs via
// useSetI18nParams). We only handle the UI side-effects here.
const onSelect = (localeCode: string) => {
  emit('selected', localeCode);
  closeDropdown(false);
};
</script>

<template>
  <div v-if="variant === 'desktop'" class="relative">
    <button
      :id="buttonId"
      :aria-label="t('navigation.change_language')"
      type="button"
      ref="buttonRef"
      aria-haspopup="menu"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="dropdownId"
      class="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
      @click="toggleDropdown"
      @keydown="onButtonKeydown"
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
        ref="menuRef"
        role="menu"
        :aria-labelledby="buttonId"
        tabindex="-1"
        class="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black/5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
        @keydown="onMenuKeydown"
      >
        <SwitchLocalePathLink
          v-for="loc in availableLocales"
          :key="loc.code"
          :locale="loc.code"
          :hreflang="loc.code"
          role="menuitem"
          class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[var(--color-text)]/70 transition-colors hover:bg-brand-secondary/10 dark:text-[var(--color-text)]/85 dark:hover:bg-brand-secondary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
          @click="onSelect(loc.code)"
        >
          <span class="uppercase font-semibold text-brand-secondary">{{ loc.code }}</span>
          <span :lang="loc.code">{{ loc.name }}</span>
        </SwitchLocalePathLink>
      </div>
    </Transition>
  </div>

  <div v-else class="flex flex-col">
    <div class="flex items-center gap-3 px-4 py-3 text-base font-medium text-[var(--color-text)]/70 dark:text-[var(--color-text)]/85">
      <FontAwesomeIcon :icon="faLanguage" class="text-xl" />
      {{ t('navigation.change_language') }}
    </div>
    <SwitchLocalePathLink
      v-for="loc in availableLocales"
      :key="loc.code"
      :locale="loc.code"
      :hreflang="loc.code"
      class="ml-4 flex items-center gap-3 rounded-xl px-6 py-2 text-sm font-medium text-[var(--color-text)]/70 transition-colors hover:bg-brand-secondary/10 dark:text-[var(--color-text)]/85 dark:hover:bg-brand-secondary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
      @click="onSelect(loc.code)"
    >
      <span class="uppercase font-semibold text-brand-secondary">{{ loc.code }}</span>
      <span :lang="loc.code">{{ loc.name }}</span>
    </SwitchLocalePathLink>
  </div>
</template>
