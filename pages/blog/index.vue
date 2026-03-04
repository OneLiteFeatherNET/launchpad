<script setup lang="ts">
import ArticleCard from "~/components/features/blog/page/card/ArticleCard.vue";
import {definePageMeta} from "#imports";
import Top1 from "~/components/features/blog/page/top1/Top1.vue";

const { t } = useI18n()
const site = useSiteConfig()

definePageMeta({
  title: 'blog.overview.title',
  layout: 'default',
});

const { top1Article, allPosts } = useBlogOverview()

usePageSeo({
  title: t('blog.overview.title'),
  description: t('blog.overview.description'),
  schemaType: 'Blog',
})

useSchemaOrg([{
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: t('navigation.home'), item: site.url },
    { '@type': 'ListItem', position: 2, name: t('blog.overview.title') }
  ]
}])
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
