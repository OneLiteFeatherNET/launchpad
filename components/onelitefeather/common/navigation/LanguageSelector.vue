<script setup lang="ts">
import { ref, computed } from '#imports';
const { t } = useI18n();

const props = defineProps<{
  variant?: 'desktop' | 'mobile';
}>();

const variant = props.variant ?? 'desktop';
const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const isOpen = ref(false);

const availableLocales = computed(() => locales.value.filter((i: any) => i.code !== locale.value));
const currentLocale = computed(() => locales.value.find((i: any) => i.code === locale.value));

const toggleDropdown = () => isOpen.value = !isOpen.value;
const selectLocale = async (localeCode: string) => { await setLocale(localeCode as 'de' | 'en'); isOpen.value = false };
</script>

<template>
  <div v-if="variant === 'desktop'" class="relative">
    <button
      @click="toggleDropdown"
      :aria-label="t('navigation.change_language')"
      class="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60"
    >
      <span class="material-symbols-outlined text-xl">language</span>
      <span class="uppercase">{{ currentLocale?.code }}</span>
      <span class="material-symbols-outlined text-xl transition-transform" :class="{ 'rotate-180': isOpen }">expand_more</span>
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
        class="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <NuxtLink
          v-for="loc in availableLocales"
          :key="loc.code"
          :to="switchLocalePath(loc.code)"
          class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[var(--color-text)]/70 transition-colors hover:bg-[var(--color-secondary)]/10 dark:text-[var(--color-text)]/70 dark:hover:bg-[var(--color-secondary)]/20"
          @click="selectLocale(loc.code)"
        >
          <span class="uppercase font-semibold text-[var(--color-secondary)]">{{ loc.code }}</span>
          <span>{{ loc.name }}</span>
        </NuxtLink>
      </div>
    </Transition>
  </div>

  <div v-else class="flex flex-col">
    <div class="flex items-center gap-3 px-4 py-3 text-base font-medium text-[var(--color-text)]/70 dark:text-[var(--color-text)]/70">
      <span class="material-symbols-outlined text-2xl">language</span>
      {{ t('navigation.change_language') }}
    </div>
    <NuxtLink
      v-for="loc in availableLocales"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      class="ml-4 flex items-center gap-3 rounded-xl px-6 py-2 text-sm font-medium text-[var(--color-text)]/70 transition-colors hover:bg-[var(--color-secondary)]/10 dark:text-[var(--color-text)]/70 dark:hover:bg-[var(--color-secondary)]/20"
      @click="selectLocale(loc.code)"
    >
      <span class="uppercase font-semibold text-[var(--color-secondary)]">{{ loc.code }}</span>
      <span>{{ loc.name }}</span>
    </NuxtLink>
  </div>
</template>
