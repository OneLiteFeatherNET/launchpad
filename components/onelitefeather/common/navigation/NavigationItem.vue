<script setup lang="ts">
import { computed } from '#imports';
import IconFa from '~/components/ui/icons/IconFa.vue';
const { t } = useI18n();

const props = defineProps<{
  textKey: string;
  path: string;
  icon?: string | [string, string];
  variant?: 'desktop' | 'mobile' | 'bottom';
}>();

const emit = defineEmits<{
  click: [];
}>();

const route = useRoute();
const variant = props.variant ?? 'desktop';

const isActive = computed(() => {
  return route.path === props.path || route.path.startsWith(props.path + '/');
});

const handleClick = () => emit('click');
</script>

<template>
  <!-- Desktop navigation item -->
  <NuxtLink
    v-if="variant === 'desktop'"
    :to="path"
    class="relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-[var(--color-text)] no-underline transition-colors hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60"
    :class="isActive ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : ''"
    @click="handleClick"
  >
    <IconFa v-if="icon" :icon="icon" class="h-4 w-4" />
    <span class="text-sm font-medium">{{ t(textKey) }}</span>
  </NuxtLink>

  <!-- Mobile overlay navigation item -->
  <NuxtLink
    v-else-if="variant === 'mobile'"
    :to="path"
    class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[var(--color-text)]/80 transition-colors hover:bg-[var(--color-secondary)]/10 dark:text-[var(--color-text)]/80 dark:hover:bg-[var(--color-secondary)]/20"
    :class="isActive ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : ''"
    @click="handleClick"
  >
    <IconFa v-if="icon" :icon="icon" class="h-5 w-5" />
    <span class="text-base">{{ t(textKey) }}</span>
  </NuxtLink>

  <!-- Bottom navigation item -->
  <NuxtLink
    v-else
    :to="path"
    class="relative flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-center transition-colors"
    :class="isActive ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]' : 'text-[var(--color-text)]/60 hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60'"
    @click="handleClick"
  >
    <IconFa v-if="icon" :icon="icon" class="h-5 w-5" />
    <span class="text-xs font-medium">{{ t(textKey) }}</span>
  </NuxtLink>
</template>
