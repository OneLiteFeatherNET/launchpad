<script setup lang="ts">
import {definePageMeta} from "#imports";
import BackButton from "~/components/common/BackButton.vue";
const { locale, t, locales } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const seoHelper = useSeoHelper({ defaultLocale: 'de' })

definePageMeta({
  layout: 'default',
});

// Get the slug from the route params
const slug = route.params.slug;
// If slug is an array, use the first element
const slugValue = Array.isArray(slug) ? slug[0] : slug;
console.log('Timeline slug from route params:', slug);
console.log('Processed timeline slug value:', slugValue);

// Fetch the history data which contains timeline items
const { data: historyData, error } = await useLocalizedContent('history');
console.log('History data:', historyData);
console.log('Error:', error);

// Find the specific timeline item with the matching slug
const timelineItem = computed(() => {
  if (!historyData.value?.timeline) return null;
  return historyData.value.timeline.find(item => item.slug === slugValue);
});
console.log('Timeline item data:', timelineItem.value);

// Find translations in other languages if translationKey exists
const alternateLanguages = ref<{locale: string, url: string}[]>([])
if (timelineItem.value?.translationKey) {
  const otherLocales = (locales.value || []).filter(l => typeof l === 'object' && l.code !== locale.value)

  for (const otherLocale of otherLocales) {
    if (typeof otherLocale === 'object') {
      // Fetch the history data in the other locale
      const { data: otherHistoryData } = await useAsyncData(
        `history_${otherLocale.code}`, 
        () => queryCollection(`history_${otherLocale.code}`).first()
      )

      // Find the matching timeline item in the other locale
      const translatedTimelineItem = otherHistoryData.value?.timeline?.find(
        item => item.translationKey === timelineItem.value?.translationKey
      )

      if (translatedTimelineItem) {
        const baseUrl = config.public.siteUrl || 'https://blog.onelitefeather.net'
        alternateLanguages.value.push({
          locale: otherLocale.code,
          url: `${baseUrl}/${otherLocale.code}/timeline/${translatedTimelineItem.slug}`
        })
      }
    }
  }
}

// Set up SEO metadata
if (timelineItem.value) {
  // Generate social media preview image if available
  let previewSocial = null
  if (timelineItem.value.image) {
    const img = useImage()
    previewSocial = img(timelineItem.value.image, {
      width: 1200,
      height: 630,
      format: 'webp',
      quality: 80,
    })
  }

  // Set basic SEO metadata
  seoHelper.setBasicSeo({
    title: timelineItem.value.title || '',
    description: timelineItem.value.description || '',
    image: previewSocial,
    type: 'article'
  })

  // Set canonical and alternate language links
  seoHelper.setCanonicalAndAlternates(
    `/timeline/${timelineItem.value.slug}`,
    timelineItem.value.translationKey,
    alternateLanguages.value
  )
}
</script>

<template>
  <div class="container mx-auto py-4">
    <BackButton />
    <article v-if="timelineItem.value" class="bg-surface dark:bg-gray-900 rounded-xxl shadow-md overflow-hidden">
      <NuxtImg v-if="timelineItem.value?.image"
               :src="timelineItem.value?.image"
               sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
               width='1920px'
               height='1080px'
               fit='cover'
               format='webp'
               quality='80'
               class="aspect-video object-cover rounded-lg w-[48rem] place-self-center" />
      <div class="p-4">
        <h1 class="text-3xl font-bold text-secondary dark:text-secondary">{{ timelineItem.value.title }}</h1>
        <div class="flex items-center mt-2 mb-4">
          <span class="text-lg font-semibold text-secondary dark:text-secondary mr-2">{{ timelineItem.value.year }}</span>
          <span v-if="timelineItem.value.month" class="text-lg font-semibold text-secondary dark:text-secondary">{{ timelineItem.value.month }}</span>
        </div>

        <div v-if="timelineItem.value.description" class="text-on-surface-variant dark:text-gray-300 mb-4">
          {{ timelineItem.value.description }}
        </div>

        <ContentRenderer v-if="timelineItem.value?.content" class="text-on-surface-variant dark:text-gray-300 mt-2" :value="timelineItem.value">
        </ContentRenderer>
      </div>
    </article>
  </div>
</template>

<style scoped>
</style>
