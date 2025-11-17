<script setup lang="ts">
import IconFa from '~/components/ui/icons/IconFa.vue';

const props = defineProps<{
  icon: string | [string,string];
  ariaLabel?: string;
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const variant = props.variant ?? 'standard';

const handleClick = (event: MouseEvent) => emit('click', event);
</script>

<template>
  <!-- Icon button with FontAwesome support -->
  <button
    type="button"
    :aria-label="ariaLabel"
    @click="handleClick"
    class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
    :class="{
      'bg-[var(--color-secondary)] text-[var(--color-white)] hover:bg-[var(--color-secondary)]/90': variant === 'filled',
      'border border-[var(--color-border)]': variant === 'outlined',
      'bg-[var(--color-surface)]/60': variant === 'tonal'
    }"
  >
    <IconFa :icon="icon" class="h-5 w-5" />
    <span class="pointer-events-none absolute inset-0 rounded-full bg-current opacity-0 transition-opacity hover:opacity-10" />
  </button>
</template>
