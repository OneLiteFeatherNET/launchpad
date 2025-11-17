<script setup lang="ts">
import NavList from './NavList.vue';

// Props for the mobile menu: items and open state
const props = defineProps<{
  items: Array<{ textKey: string; path: string; icon?: string | [string,string] }>;
  open: boolean;
}>();
</script>

<template>
  <Transition name="fade-down">
    <div v-if="open" class="md:hidden bg-surface dark:bg-surface border-t border-border dark:border-border">
      <nav class="px-4 py-3 space-y-1">
        <NavList :items="items" variant="mobile" />
      </nav>
    </div>
  </Transition>
</template>
