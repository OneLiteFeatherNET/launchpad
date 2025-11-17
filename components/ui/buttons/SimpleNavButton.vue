<script setup lang="ts">
const props = defineProps<{
  textKey: string;
  path: string;
  mobile?: boolean;
}>();

const emit = defineEmits(['click-mobile']);
const route = useRoute();
const { t } = useI18n();
</script>

<template>
  <NuxtLink
    v-if="!mobile"
    :key="path"
    :to="path"
    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors shadow-sm no-underline text-[var(--color-text)] hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60"
    :class="route.path === path ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : ''"
    :aria-current="route.path === path ? 'page' : undefined"
  >
    {{ t(textKey) }}
  </NuxtLink>

  <NuxtLink
    v-else
    :key="path"
    :to="path"
    class="block px-3 py-2 text-base font-medium rounded-full transition-colors no-underline text-[var(--color-text)] hover:bg-[var(--color-secondary)]/10 dark:hover:bg-[var(--color-secondary)]/20"
    :class="route.path === path ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : ''"
    :aria-current="route.path === path ? 'page' : undefined"
    @click="emit('click-mobile')"
    role="menuitem"
  >
    {{ t(textKey) }}
  </NuxtLink>
</template>

<style scoped>
</style>
