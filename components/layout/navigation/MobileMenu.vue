<script setup lang="ts">
import NavList from './NavList.vue';
const { t } = useI18n();

// Props for the mobile menu: items and open state
const props = defineProps<{
  items: Array<{ textKey: string; path: string; icon?: string | [string,string] }>;
  open: boolean;
}>();
</script>

<template>
  <Transition name="fade-down">
    <div v-if="open" class="lg:hidden bg-[var(--color-surface)] dark:bg-[var(--color-surface)] border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
      <nav class="px-4 py-3 space-y-1" role="navigation" :aria-label="t('navigation.mobile')">
        <NavList :items="items" variant="mobile" />
      </nav>
    </div>
  </Transition>
</template>
