<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()

definePageMeta({ layout: 'default' })

const { person, articles, authorsOf } = await useBlogAuthorPage()
const name = computed(() => person.value?.name ?? '')

usePageSeo({
  title: t('blog.author.title', { name: name.value }),
  description: t('blog.author.description', { name: name.value }),
  schemaType: 'CollectionPage'
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` },
  { name: t('blog.overview.title'), url: `/${locale.value}/blog` },
  { name: name.value }
])
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 md:px-6 py-6 md:py-8">
    <h1 class="sr-only">{{ t('blog.author.title', { name }) }}</h1>
    <AuthorBox v-if="person" :person="person" />
    <h2 class="mt-8 text-headline-small font-bold text-on-surface">
      {{ t('blog.author.posts_by', { name }) }}
    </h2>
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <ArticleCard
        v-for="article in articles"
        :key="article.slug"
        :blog-article="article"
        :authors="authorsOf(article)"
      />
    </div>
  </div>
</template>
