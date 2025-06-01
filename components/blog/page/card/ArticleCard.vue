<script setup lang="ts">
import type {BlogDeCollectionItem, BlogEnCollectionItem} from '@nuxt/content';
const {getFeatureFlag } = usePostHogFeatureFlag();


const {locale} = useI18n();
const {blogArticle} = defineProps<{
  blogArticle: BlogDeCollectionItem | BlogEnCollectionItem;
}>();
const title = computed(() => {
  if (getFeatureFlag('blog-ethanol-conversion').value === 'test') {
    return blogArticle?.alternativeTitle || blogArticle?.title || 'No Title';
  } else {
    return blogArticle?.title || 'No Title';
  }
});
</script>

<template>
  <article v-if="blogArticle" class="bg-white dark:bg-gray-800 rounded-xxl shadow-md overflow-hidden">
    <NuxtLink :to="`/${locale}/${blogArticle.slug}`" v-posthog-capture="'blog-article-card-click'">
      <NuxtImg v-if="blogArticle?.headerImage"
               :src="blogArticle?.headerImage"
               :alt="blogArticle?.headerImageAlt"
               sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
               width='1920px'
               height='1080px'
               fit='cover'
               format='webp'
               quality='80'
               class="w-full h-48 object-cover rounded-xxl" />
      <div class="p-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
        <time v-if="blogArticle?.pubDate" class="text-sm text-gray-500 dark:text-gray-400"><i18n-d :value="blogArticle?.pubDate"></i18n-d></time>
        <ContentRenderer class="text-gray-700 dark:text-gray-300 mt-2" :value="blogArticle" excerpt="true">
        </ContentRenderer>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>

</style>