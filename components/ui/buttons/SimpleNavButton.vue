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
    class="olf-btn olf-btn--simple"
    :aria-current="route.path === path ? 'page' : undefined"
  >
    {{ t(textKey) }}
  </NuxtLink>

  <NuxtLink
    v-else
    :key="path"
    :to="path"
    class="olf-btn olf-btn--simple olf-btn--mobile"
    :aria-current="route.path === path ? 'page' : undefined"
    @click="emit('click-mobile')"
    role="menuitem"
  >
    {{ t(textKey) }}
  </NuxtLink>
</template>

<style scoped>
/* Simple nav button variants mapped to design tokens */
.olf-btn--simple {
  @apply px-4 py-2 text-sm font-medium rounded-full transition-colors shadow-sm text-text dark:text-text;
}
.olf-btn--simple.olf-btn--mobile {
  @apply block px-3 py-2 text-base font-medium rounded-full;
}
.olf-btn--simple[aria-current='page'] {
  @apply bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm;
}
</style>
