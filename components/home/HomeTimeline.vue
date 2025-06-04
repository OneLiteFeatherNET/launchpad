<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  customTimeline: {
    type: Array,
    default: () => []
  },
  useCustomData: {
    type: Boolean,
    default: false
  }
});

// Fetch history data which contains timeline items if not using custom data
const { data: historyData } = !props.useCustomData 
  ? await useLocalizedContent('history')
  : { data: ref(null) };

// Get title from props or from history data
const title = computed(() => {
  if (props.title) return props.title;
  return historyData.value?.title || '';
});

// Get timeline items from props or from history data
const timelineItems = computed(() => {
  if (props.useCustomData) return props.customTimeline;
  return historyData.value?.timeline || [];
});

// Sort timeline items by year (newest first)
const sortedTimeline = computed(() => {
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

// Get the 2 newest entries
const newestEntries = computed(() => {
  return sortedTimeline.value.slice(0, 2);
});

// Get the 2 oldest entries
const oldestEntries = computed(() => {
  return [...sortedTimeline.value].reverse().slice(0, 2);
});

// Create a middle entry that links to the full timeline
const middleEntry = computed(() => {
  return {
    year: t('timeline.view_all_year'),
    description: t('timeline.view_all_description'),
    isViewAllLink: true
  };
});

// Combine the entries for display
const displayEntries = computed(() => {
  // return sortedTimeline.value;
  return [...newestEntries.value, middleEntry.value, ...oldestEntries.value];
});
</script>

<template>
  <section class="py-16 bg-surface dark:bg-gray-900">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center text-secondary dark:text-secondary mb-12">{{ title }}</h2>

      <div class="relative overflow-y-auto pb-8" role="region" :aria-label="$t('timeline.label')" tabindex="0">
        <div class="relative py-5">
          <!-- Vertical line in the middle -->
          <div class="absolute top-0 bottom-0 w-1 bg-secondary dark:bg-secondary dark:opacity-80 transform -translate-x-1/2 md:left-1/2 left-10"></div>

          <!-- Timeline Items -->
          <div 
            v-for="(item, index) in displayEntries" 
            :key="index"
            :class="[
              'p-6 md:p-6 sm:p-3 rounded-lg shadow-md relative overflow-hidden md:w-[45%] w-[calc(100%-60px)] mb-8 md:mb-8 sm:mb-6',
              index % 2 === 0 ? 'md:mr-auto md:ml-0' : 'md:ml-auto md:mr-0',
              'ml-16 sm:ml-16',
              'relative z-1',
              item.color === 'secondary'
                ? 'bg-secondary-container dark:bg-secondary-container-dark'
                : `bg-${item.color}-container dark:bg-${item.color}-container-dark`
            ]"
            role="article"
          >
            <!-- Timeline dot -->
            <div 
              :class="[
                'absolute w-4 h-4 sm:w-3 sm:h-3 bg-secondary dark:bg-secondary dark:opacity-90 rounded-full top-5 z-5',
                index % 2 === 0 ? 'md:right-[-38px] md:left-auto' : 'md:left-[-38px] md:right-auto',
                'left-[-36px] sm:left-[-36px]',
                'dark:shadow-[0_0_5px_rgba(255,255,255,0.3)]'
              ]"
            ></div>

            <!-- Background color overlay with higher opacity -->
            <div 
              :class="[
                'absolute inset-0',
                item.color === 'secondary' 
                  ? 'bg-secondary dark:bg-secondary opacity-30 dark:opacity-40' 
                  : `bg-${item.color} dark:bg-${item.color} opacity-30 dark:opacity-40`
              ]"
            ></div>

            <div class="relative z-1">
              <h3 :class="[
                'text-xl font-bold mb-2',
                item.color === 'secondary' 
                  ? 'text-secondary dark:text-secondary' 
                  : `text-${item.color} dark:text-${item.color}`
              ]">
                {{ item.year }}
                <span v-if="item.month" class="ml-2">{{ item.month }}</span>
              </h3>
              <p class="text-on-surface-variant dark:text-gray-300">{{ item.description }}</p>

              <!-- Link to detail page if slug is available -->
              <div v-if="item.slug" class="mt-3">
                <NuxtLink 
                  :to="`/timeline/${item.slug}`"
                  class="inline-flex items-center text-sm font-medium text-secondary dark:text-secondary hover:underline"
                >
                  {{ $t('timeline.read_more') }}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>

              <!-- Link to full timeline page for the middle entry -->
              <div v-if="item.isViewAllLink" class="mt-3">
                <NuxtLink 
                  to="/timeline"
                  class="inline-flex items-center text-sm font-medium text-secondary dark:text-secondary hover:underline"
                >
                  {{ $t('timeline.view_all') }}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
