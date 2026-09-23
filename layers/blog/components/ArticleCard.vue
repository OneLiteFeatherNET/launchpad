<script setup lang="ts">
import type { BlogArticle } from "../types";

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
  <!--
    Only the title is a link; M3CardLink stretches it over the whole card.
    Wrapping the card in one link made the excerpt's own links nest inside
    it — invalid HTML the parser rearranges, which is what broke hydration
    on posts whose excerpt contains a link.
  -->
  <M3Card v-if="blogArticle" as="article" variant="outlined" interactive>
    <template #media>
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
        :img-attrs="{ class: 'w-full h-48 object-cover' }"
      />
    </template>
    <h2 class="text-title-large text-on-surface">
      <M3CardLink
        v-posthog-capture="'blog-article-card-click'"
        :to="`/${locale}/blog/${blogArticle.slug}`"
      >
        {{ title }}
      </M3CardLink>
    </h2>
    <time class="mt-0.5 block text-body-small text-on-surface-variant">
      {{ d(new Date(blogArticle.pubDate as any)) }}
    </time>
    <div v-if="blogArticle.tags?.length" class="mt-2 flex flex-wrap gap-2">
      <M3Chip
        v-for="tag in blogArticle.tags"
        :key="tag"
        :label="tag"
        kind="label"
      />
    </div>
    <!-- Links in the excerpt sit above the stretched card link, so they stay clickable. -->
    <ContentRenderer
      class="mt-3 text-body-medium text-on-surface-variant [&_a]:relative [&_a]:z-10"
      :value="blogArticle"
      :excerpt="true"
    />
  </M3Card>
</template>
