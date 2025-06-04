<script setup lang="ts">
import { definePageMeta } from "#imports";
const { locale, t } = useI18n();
const seoHelper = useSeoHelper({ defaultLocale: 'de' });

definePageMeta({
  layout: 'default',
});

// Fetch history data which contains timeline items
const { data: historyData } = await useLocalizedContent('history');

// Extract timeline items from history data
const timelineItems = computed(() => historyData.value?.timeline || []);

// Sort timeline items by year (and month if available)
const sortedTimelineItems = computed(() => {
  if (!timelineItems.value || timelineItems.value.length === 0) return [];

  return [...timelineItems.value].sort((a, b) => {
    // First compare by year
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;

    if (yearA !== yearB) {
      return yearA - yearB; // Descending order (newest first)
    }

    // If years are the same, compare by month if available
    if (a.month && b.month) {
      return b.month.localeCompare(a.month);
    }

    // If one has a month and the other doesn't, the one with a month comes first
    if (a.month) return -1;
    if (b.month) return 1;

    return 0;
  });
});

// Set up SEO metadata
seoHelper.setBasicSeo({
  title: t('timeline.meta.title'),
  description: t('timeline.meta.description'),
  type: 'website'
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold text-center text-secondary dark:text-secondary mb-8">{{ $t('timeline.title') }}</h1>

    <div class="grid gap-6">
      <div v-for="item in sortedTimelineItems" :key="item.slug" 
           class="bg-surface dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <NuxtLink :to="`/timeline/${item.slug}`" class="block p-6">
          <div class="flex items-center mb-2">
            <span class="text-xl font-bold text-secondary dark:text-secondary mr-2">{{ item.year }}</span>
            <span v-if="item.month" class="text-lg text-secondary dark:text-secondary">{{ item.month }}</span>
          </div>
          <h2 class="text-xl font-semibold text-secondary dark:text-secondary mb-2">{{ item.title }}</h2>
          <p class="text-on-surface-variant dark:text-gray-300">{{ item.description }}</p>
        </NuxtLink>
      </div>
    </div>

    <div v-if="sortedTimelineItems.length === 0" class="text-center py-8">
      <p class="text-on-surface-variant dark:text-gray-300">{{ $t('timeline.no_items') }}</p>
    </div>
  </div>
</template>

<style scoped>
</style>
