<script setup lang="ts">
import type { BlogArticle, CardAuthor } from '../types'
const {locale, d} = useI18n();
const {blogArticle, authors = []} = defineProps<{
  blogArticle: BlogArticle;
  authors?: CardAuthor[];
}>();
</script>

<template>
  <!-- Same pattern as ArticleCard: only the title links, stretched over the card. -->
  <M3Card as="article" variant="outlined" interactive class="xl:mx-80">
    <template #media>
      <NuxtPicture
        v-if="blogArticle.headerImage"
        :src="blogArticle.headerImage"
        :alt="blogArticle.headerImageAlt"
        sizes="xs:300px sm:500px md:700px lg:1200px xl:1920px"
        width="1920"
        height="1080"
        fit="cover"
        quality="80"
        format="avif,webp"
        :img-attrs="{ class: 'w-full h-96 object-cover' }"
      />
    </template>
    <h1 class="text-headline-small text-on-surface">
      <M3CardLink :to="`/${locale}/blog/${blogArticle.slug}`">
        {{ blogArticle.title }}
      </M3CardLink>
    </h1>
    <time class="mt-0.5 block text-body-small text-on-surface-variant">
      {{ d(new Date(blogArticle.pubDate as any)) }}
    </time>
    <div v-if="authors?.length" class="mt-1 flex flex-wrap gap-x-4">
      <PersonLink
        v-for="author in authors"
        :key="author.slug"
        :name="author.name"
        :to="author.profilePath"
        class="relative z-10 w-fit"
      />
    </div>
    <div v-if="blogArticle.tags?.length" class="mt-2 flex flex-wrap gap-2">
      <M3Chip
        v-for="tag in blogArticle.tags"
        :key="tag"
        :label="tag"
        kind="label"
      />
    </div>
    <p class="mt-3 text-body-medium text-on-surface-variant">{{ blogArticle.description }}</p>
  </M3Card>
</template>

<style scoped>
</style>
