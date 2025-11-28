<script setup lang="ts">
import { computed } from 'vue'
import IconFa from '~/components/ui/icons/IconFa.vue';

const props = defineProps<{
  icon: string | [string,string];
  ariaLabel?: string;
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
  /**
   * Sichtbarkeit/Ergonomie: Größe des Buttons (und des Icons)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const variant = props.variant ?? 'standard';
const size = computed(() => props.size ?? 'md');

const btnSizeClass = computed(() => ({
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
})[size.value]);

const iconSizeClass = computed(() => ({
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
})[size.value]);

const handleClick = (event: MouseEvent) => emit('click', event)
</script>

<template>
  <!-- Icon button with FontAwesome support -->
  <button
    type="button"
    :aria-label="ariaLabel"
    @click="handleClick"
    class="relative inline-flex items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]"
    :class="[
      btnSizeClass,
      {
        'bg-[var(--color-brand-secondary)] text-[var(--color-white)] hover:bg-[var(--color-brand-secondary)]/90': variant === 'filled',
        'border border-[var(--color-border)]': variant === 'outlined',
        'bg-[var(--color-surface)]/60': variant === 'tonal'
      }
    ]"
  >
    <IconFa :icon="icon" :class="iconSizeClass" />
    <span class="pointer-events-none absolute inset-0 rounded-full bg-current opacity-0 transition-opacity hover:opacity-10" />
  </button>
</template>
