<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'GradientText' });

const props = withDefaults(defineProps<{
  /** Welches HTML-Tag gerendert werden soll (z. B. span, h1, p) */
  as?: string;
  /** Verlaufsauswahl: 'brand' (Standard) oder 'accent' */
  variant?: 'brand' | 'accent';
  /** Helligkeit des Verlaufs: 'normal' (Standard) oder 'light' für hellere Farben */
  tone?: 'normal' | 'light';
}>(), {
  as: 'span',
  variant: 'brand',
  tone: 'normal'
});

const variantClass = computed(() => {
  const base = props.variant === 'accent' ? 'text-gradient-accent' : 'text-gradient-brand';
  return props.tone === 'light' ? `${base}-light` : base;
});
</script>

<template>
  <!--
    Root-Element ist dynamisch. Klassen vom Aufrufer (z. B. Größe/Gewicht) werden automatisch gemerged.
  -->
  <component :is="props.as" :class="[variantClass]">
    <slot />
  </component>
  
</template>
