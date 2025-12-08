<script setup lang="ts">
import ArticleCard from "~/components/features/blog/page/card/ArticleCard.vue";
import {definePageMeta} from "#imports";
import Top1 from "~/components/features/blog/page/top1/Top1.vue";

const { t } = useI18n()

definePageMeta({
  title: 'blog.overview.title',
  layout: 'default',
});

const { top1Article, allPosts } = useBlogOverview()

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg'
    }
  ]
})

const img = useImage()
const previewSocial = img('images/logo.svg', {
  width: 1200,
  height: 630,
  format: 'webp',
  quality: 80,
});

useSeoMeta({
  description: t('blog.overview.description'),
  ogDescription: t('blog.overview.description'),
  ogImage: previewSocial,
  twitterTitle: t('blog.overview.title'),
  twitterDescription: t('blog.overview.description'),
  twitterImage: previewSocial
})

useSchemaOrg({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: t('blog.overview.title'),
  description: t('blog.overview.description'),
  url: previewSocial,
  image: previewSocial, // Replace with your blog image URL
})
</script>

<template>
  <div class="container mx-auto py-4">
    <Top1
        v-if="top1Article"
        :blogArticle="top1Article"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mx-16">
      <ArticleCard
        v-for="article in allPosts"
        :key="article.slug"
        :blogArticle="article"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
