<script setup lang="ts">
import {definePageMeta} from "#imports";
const { locale, t } = useI18n()
const route = useRoute()

definePageMeta({
  layout: 'blog-entry',
});

const pathParts = route.path.split('/');
const { data: article} = await useAsyncData(route.path, () => {
  // @ts-ignore
  return queryCollection('blog_'+locale?.value ?? 'de').where("slug", "=", pathParts.at(2)).first();
});
useSeoMeta(article.value?.seo || {
})
const img = useImage()
const previewSocial = img(article.value?.headerImage || 'logo.svg', {
  width: 1200,
  height: 630,
  format: 'webp',
  quality: 80,
});
useSeoMeta({
  twitterTitle: article?.value?.seo?.title || article?.value?.title || '',
  twitterDescription: article?.value?.seo?.description || '',
  ogImage: previewSocial,
  twitterImage: previewSocial
})

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png'
    }
  ]
})
useHead(article?.value?.head || {})
</script>

<template>
  <div class="container mx-auto py-4">
    <article v-if="article" class="bg-white dark:bg-gray-800 rounded-xxl shadow-md overflow-hidden">
      <NuxtImg v-if="article?.headerImage"
               :src="article?.headerImage"
               :alt="article?.headerImageAlt"
               sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
               width='1920px'
               height='1080px'
               fit='cover'
               format='webp'
               quality='80'
               class="aspect-video object-cover rounded-lg" />
      <div class="p-4">
        <time v-if="article?.pubDate" class="text-sm text-gray-500 dark:text-gray-400"><i18n-d :value="article?.pubDate"></i18n-d></time>
        <ContentRenderer class="text-gray-700 dark:text-gray-300 mt-2" :value="article">
        </ContentRenderer>
      </div>
    </article>
  </div>
</template>

<style scoped>

</style>