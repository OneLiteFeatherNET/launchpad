<script setup lang="ts">
import {definePageMeta} from "#imports";
definePageMeta({
  title: 'blog.imprint.title',
});
</script>

<template>
  <div class="container mx-auto py-4 dark:text-white">
    <div class="space-y-2">
      <p class="font-semibold">Phillipp Glanz</p>
      <p>Geisinger Straße 6</p>
      <p>71634 Ludwigsburg</p>
      <p>
        <span class="font-semibold">Mail:</span>
        <a href="mailto:contact@onelitefeather.net" class="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-sm transition-colors"> contact@onelitefeather.net</a>
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>