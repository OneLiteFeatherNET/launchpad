<script setup lang="ts">
import type { BlogArticle } from "~/types/blog";
import UiChip from '~/components/base/Chip.vue'

const {getFeatureFlag } = usePostHogFeatureFlag();
const {locale, d} = useI18n();

const { blogArticle } = defineProps<{
  blogArticle: BlogArticle;
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
  <article
    v-if="blogArticle"
    class="bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <NuxtLink
      v-posthog-capture="'blog-article-card-click'"
      :to="`/${locale}/blog/${blogArticle.slug}`"
      class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-xl">
      <div class="relative">
        <!--
          `sizes` in viewport fractions, matching the grid in
          pages/blog/index.vue: one column, then two, then three. A fixed pixel
          width cannot track a fluid column, and the previous `xl:1920px` had
          @nuxt/image offer a 3840px source for a card about 373px wide.

          Lazy because the overview's LCP is Top1's header above these cards.
        -->
        <NuxtPicture
          v-if="blogArticle?.headerImage"
          :src="blogArticle?.headerImage"
          :alt="blogArticle?.headerImageAlt"
          sizes="xs:100vw sm:50vw md:33vw"
          width="1920"
          height="1080"
          fit="cover"
          quality="80"
          format="avif,webp"
          loading="lazy"
          :img-attrs="{ class: 'w-full h-48 object-cover rounded-t-xl' }"
        />
        <!-- Material 3 state layer -->
        <div aria-hidden="true" class="absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 transition-colors"/>
      </div>
      <div class="p-4">
        <!-- title-large approximation -->
        <h2 class="text-[22px] leading-7 font-medium text-gray-900 dark:text-gray-100">{{ title }}</h2>
        <!-- body-small for supporting text like dates -->
        <time class="block text-sm text-gray-600 dark:text-gray-400 mt-0.5">{{ d(new Date(blogArticle.pubDate as any)) }}</time>
        <div v-if="blogArticle.tags?.length" class="mt-2 flex flex-wrap gap-2">
          <UiChip
            v-for="tag in blogArticle.tags"
            :key="tag"
            :label="tag"
            variant="outlined"
            as="span"
          />
        </div>
        <!-- body-medium content excerpt -->
        <ContentRenderer class="text-gray-700 dark:text-gray-300 mt-3" :value="blogArticle" :excerpt="true"/>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>

</style>
