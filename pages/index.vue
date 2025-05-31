<script setup lang="ts">
import ArticleCard from "~/components/blog/page/card/ArticleCard.vue";
import {definePageMeta} from "#imports";
import Top1 from "~/components/blog/page/top1/Top1.vue";
const { locale, t } = useI18n()

definePageMeta({
  title: 'blog.overview.title',
});
const { data: top1Article} = await useAsyncData('top1', () => {
  // @ts-ignore
  return queryCollection('blog_'+locale?.value ?? 'de').order('pubDate', 'DESC').first();
});

const {data: allPostsData} = await useAsyncData('all-posts', () => {
  // @ts-ignore
  return queryCollection('blog_'+locale?.value ?? 'de').order('pubDate', 'DESC').all();
});
const allPosts = allPostsData.value?.slice(1); // Remove the first item as it is already displayed in Top1
useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg'
    }
  ]
})
useSeoMeta({
  description: t('blog.overview.description'),
  ogDescription: t('blog.overview.description'),
  ogImage: 'images/logo.svg',
  twitterTitle: t('blog.overview.title'),
  twitterDescription: t('blog.overview.description'),
  twitterImage: 'images/logo.svg'
})
useSchemaOrg({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: t('blog.overview.title'),
  description: t('blog.overview.description'),
  url: '',
  image: 'https://example.com/images/logo.svg', // Replace with your blog image URL
})
</script>

<template>
  <div class="container mx-auto py-4">
    <Top1
        v-if="top1Article"
        :blogArticle="top1Article"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      <ArticleCard
          v-for="article in allPosts"
          :blogArticle="article" />
    </div>
  </div>
</template>

<style scoped>

</style>