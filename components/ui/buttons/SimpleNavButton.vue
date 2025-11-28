<script setup lang="ts">
const props = defineProps<{
  textKey: string;
  path: string;
  mobile?: boolean;
}>();

const emit = defineEmits(['click-mobile']);
const route = useRoute();
const { t } = useI18n();

// Mark button as active not only on the exact path but also on its subpages (unterseiten)
const isActive = computed(() => {
  // Normalize to avoid issues with trailing slashes
  const current = (route.path || '/').replace(/\/+$/g, '') || '/';
  const target = (props.path || '/').replace(/\/+$/g, '') || '/';

  // Home should only match exactly
  if (target === '/') return current === '/';

  // Active if exact match or when browsing any sub-route under the target
  return current === target || current.startsWith(target + '/');
});
</script>

<template>
  <NuxtLink
    v-if="!mobile"
    :key="path"
    :to="path"
    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors shadow-sm no-underline text-[var(--color-text)] hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60"
    :class="isActive ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : ''"
    :aria-current="isActive ? 'page' : undefined"
  >
    {{ t(textKey) }}
  </NuxtLink>

  <NuxtLink
    v-else
    :key="path"
    :to="path"
    class="block px-3 py-2 text-base font-medium rounded-full transition-colors no-underline text-[var(--color-text)] hover:bg-[var(--color-secondary)]/10 dark:hover:bg-[var(--color-secondary)]/20"
    :class="isActive ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : ''"
    :aria-current="isActive ? 'page' : undefined"
    @click="emit('click-mobile')"
    role="menuitem"
  >
    {{ t(textKey) }}
  </NuxtLink>
</template>

<style scoped>
</style>
