<script setup lang="ts">
import ArticleCard from "~/components/features/blog/page/card/ArticleCard.vue";
import {definePageMeta} from "#imports";
import Top1 from "~/components/features/blog/page/top1/Top1.vue";

const { t, locale } = useI18n()
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
  keywords: [
    'OneLiteFeather blog',
    'Minecraft development blog',
    'Minecraft plugin development',
    'Paper plugin development',
    'open source Minecraft'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}/` }, { name: t('blog.overview.title') }
])

// Help Google identify the list of articles as a structured collection.
useSchemaOrg(() => {
  const articles = [top1Article.value, ...(allPosts.value || [])].filter(Boolean)
  if (!articles.length) return []
  return [
    {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        url: new URL(`/${locale.value}/blog/${article!.slug}`, site.url).toString(),
        name: article!.title
      }))
    }
  ]
})
</script>

<template>
  <div class="container mx-auto py-4">
    <Top1
        v-if="top1Article"
        :blog-article="top1Article"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mx-16">
      <ArticleCard
        v-for="article in allPosts"
        :key="article.slug"
        :blog-article="article"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
