<script setup lang="ts">
import type { BlogDeCollectionItem, BlogEnCollectionItem} from '@nuxt/content';
const {locale} = useI18n();
const {blogArticle} = defineProps<{
  blogArticle: BlogDeCollectionItem | BlogEnCollectionItem;
}>();
</script>

<template>
  <article
    class="bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden xl:mx-80">
    <NuxtLink
      :to="`/${locale}/blog/${blogArticle.slug}`"
      class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-xl">
      <div class="relative">
        <NuxtImg v-if="blogArticle.headerImage"
                 :src="blogArticle.headerImage"
                 :alt="blogArticle.headerImageAlt"
                 sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
                 width='1920px'
                 height='1080px'
                 fit='cover'
                 format='webp'
                 quality='80'
                 class="w-full h-96 object-cover rounded-t-xl" />
        <!-- Material 3 state layer -->
        <div aria-hidden="true" class="absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 transition-colors"></div>
      </div>
      <div class="p-4">
        <!-- title-large approximation -->
        <h1 class="text-[22px] leading-7 font-medium text-gray-900 dark:text-gray-100">{{ blogArticle.title }}</h1>
        <!-- body-small date -->
        <time class="block text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          <i18n-d :value="Date.parse(blogArticle.pubDate)"></i18n-d>
        </time>
        <!-- body-medium description -->
        <p class="text-gray-700 dark:text-gray-300 mt-3">{{ blogArticle.description }}</p>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
</style>
