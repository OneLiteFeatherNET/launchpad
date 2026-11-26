<script setup lang="ts">
/**
 * Wraps a page's skeleton: marks the area busy and gives screen readers a
 * loading text in the page language. The blocks inside are `aria-hidden`.
 */
</script>

<template>
  <div aria-busy="true">
    <span role="status" class="sr-only">{{ $t('loading.label') }}</span>
    <slot />
  </div>
</template>
