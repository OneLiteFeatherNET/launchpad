<script setup lang="ts">
import type { BlogArticle } from '~/types/blog'
import UiChip from '~/components/base/Chip.vue'
const {locale, d} = useI18n();
const {blogArticle} = defineProps<{
  blogArticle: BlogArticle;
}>();
</script>

<template>
  <article
    class="bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden xl:mx-80">
    <NuxtLink
      :to="`/${locale}/blog/${blogArticle.slug}`"
      class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-xl">
      <div class="relative">
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
          :img-attrs="{ class: 'w-full h-96 object-cover rounded-t-xl' }"
        />
        <!-- Material 3 state layer -->
        <div aria-hidden="true" class="absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 transition-colors"></div>
      </div>
      <div class="p-4">
        <!-- title-large approximation -->
        <h1 class="text-[22px] leading-7 font-medium text-gray-900 dark:text-gray-100">{{ blogArticle.title }}</h1>
        <!-- body-small date -->
        <time class="block text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {{ d(new Date(blogArticle.pubDate as any)) }}
        </time>
        <div v-if="blogArticle.tags?.length" class="mt-2 flex flex-wrap gap-2">
          <UiChip
            v-for="tag in blogArticle.tags"
            :key="tag"
            :label="tag"
            variant="outlined"
            as="span"
          />
        </div>
        <!-- body-medium description -->
        <p class="text-gray-700 dark:text-gray-300 mt-3">{{ blogArticle.description }}</p>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
</style>
