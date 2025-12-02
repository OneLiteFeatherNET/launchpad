<script setup lang="ts">
import {definePageMeta} from "#imports";
import SocialMediaShare from "~/components/blog/SocialMediaShare.vue";
import type { BlogArticle } from "~/types/blog";
import { extractPlainTextFromExcerpt } from "~/utils/content";

const { locale, t, d } = useI18n()
const config = useRuntimeConfig()
const {getFeatureFlag } = usePostHogFeatureFlag();

definePageMeta({
  layout: 'default',
});

const { blog, headLinks } = useBlogArticle()

const img = useImage()
const previewSocial = computed(() =>
  img(blog.value?.headerImage || 'images/logo.svg', {
    width: 1200,
    height: 630,
    format: 'webp',
    quality: 80,
  })
)

// Canonical URL for OG tags
const baseUrl = computed(() => config.public.siteUrl || config.public.baseUrl || 'https://blog.onelitefeather.net')
const canonicalUrl = computed(() =>
  blog.value ? (blog.value.canonical || `${baseUrl.value}/${locale.value}/blog/${blog.value.slug}`) : baseUrl.value
)

// Use a single useHead call to set links (and merge with any useSeoMeta output)
useHead(() => ({ link: headLinks.value }))
useHead(() => (blog.value as BlogArticle | null)?.head || {})

const title = computed(() => {
  if (getFeatureFlag('alternative-title-conversion').value === 'test') {
    return blog?.value?.alternativeTitle || blog?.value?.title || t('layouts.title');
  } else {
    return blog?.value?.title || t('layouts.title');
  }
});

// Ensure the document title and meta reflect the article
useSeoMeta(() => {
  const seo = (blog.value as any)?.seo || {}
  const metaTitle = seo.title || title.value
  const metaDescription =
    seo.description || blog.value?.description || extractPlainTextFromExcerpt((blog.value as any)?.excerpt) || ''
  return {
    title: metaTitle,
    ogTitle: seo.ogTitle || metaTitle,
    twitterTitle: seo.twitterTitle || metaTitle,
    description: metaDescription,
    ogDescription: seo.ogDescription || metaDescription,
    ogImage: previewSocial.value,
    twitterImage: previewSocial.value,
    ogType: 'article',
    ogUrl: canonicalUrl.value,
    twitterCard: 'summary_large_image',
    ogImageAlt: blog.value?.headerImageAlt || blog.value?.title || ''
  }
})
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 md:px-6 py-6 md:py-8">
    <article
      v-if="blog"
      class="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
      role="article"
      :aria-labelledby="'article-title'"
    >
      <NuxtPicture
        v-if="blog?.headerImage"
        :src="blog?.headerImage"
        :alt="blog?.headerImageAlt || blog?.title || ''"
        sizes="xs:300px sm:500px md:700px lg:1200px xl:1920px"
        width="1920"
        height="1080"
        fit="cover"
        quality="80"
        :img-attrs="{ class: 'aspect-video object-cover w-full' }"
        format="avif,webp"
      />
      <div class="p-6 md:p-8">
        <h1 id="article-title" class="text-4xl/10 font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{{ title }}</h1>
        <time
          v-if="blog?.pubDate"
          class="mt-1 block text-sm text-neutral-600 dark:text-neutral-400"
          :datetime="new Date(blog?.pubDate).toISOString()"
        >
          {{ d(new Date(blog?.pubDate as any)) }}
        </time>

        <section
          class="prose prose-neutral dark:prose-invert mt-4 md:mt-6 max-w-none"
          :aria-labelledby="'article-content-heading'"
        >
          <h2 id="article-content-heading" class="sr-only">{{ title }}</h2>
          <ContentRenderer :value="blog" />
        </section>

        <!-- Social Media Sharing Buttons -->
        <section class="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-6" :aria-label="t('article.share')">
          <h2 class="sr-only">{{ t('article.share') }}</h2>
          <SocialMediaShare
            :url="`${config.public.siteUrl}/${locale.value}/blog/${blog?.slug || ''}`"
            :title="blog?.title"
            :description="blog?.description || ''"
            :is-large-page="['alles-was-man-ueber-ethanol-wissen-sollte', 'riding-the-rollercoaster-of-automation-with-proxmox-and-ansible', 'plugins-open-for-adoption', 'effizientes-logging-in-paper-plugins', 'dev-blog-1'].includes(blog?.slug)"
          />
        </section>
      </div>
    </article>
  </div>
</template>

<style scoped>

</style>
