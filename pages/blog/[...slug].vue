<script setup lang="ts">
import {definePageMeta} from "#imports";
import SocialMediaShare from "~/components/blog/SocialMediaShare.vue";
const { locale, t, locales } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const {getFeatureFlag } = usePostHogFeatureFlag();

definePageMeta({
  layout: 'default',
});

const pathParts = route.path.split('/');
const { data: article} = await useAsyncData(route.path, () => {
  // @ts-ignore
  return queryCollection('blog_'+locale?.value || 'blog_de').where("slug", "=", pathParts.at(3)).first();
});

// Avoid logging content data in production for privacy

// Provide a typed (any) alias to avoid union type issues from content manifest
const blog = computed(() => article.value as any);

// Find translations in other languages if translationKey exists
const alternateLanguages = ref<{locale: string, url: string}[]>([]);
if (blog.value?.translationKey) {
  const otherLocales = (locales.value || []).filter(l => typeof l === 'object' && l.code !== locale.value);

  for (const otherLocale of otherLocales) {
    if (typeof otherLocale === 'object') {
      const { data: translatedArticle } = await useAsyncData(`${route.path}_${otherLocale.code}`, () => {
        // @ts-ignore
        return queryCollection(`blog_${otherLocale.code}`).where("translationKey", "=", blog.value?.translationKey).first();
      });

      if (translatedArticle.value) {
        const baseUrl = config.public.siteUrl || config.public.baseUrl || 'https://blog.onelitefeather.net';
        // Prefer full ISO hreflang if available, fallback to code
        const hreflangValue = (otherLocale as any).iso || (otherLocale as any)._hreflang || otherLocale.code;
        alternateLanguages.value.push({
          locale: hreflangValue,
          url: `${baseUrl}/${otherLocale.code}/blog/${(translatedArticle.value as any).slug}`
        });
      }
    }
  }
}
useSeoMeta(blog.value?.seo || {})
const img = useImage()
const previewSocial = img(blog.value?.headerImage || 'logo.svg', {
  width: 1200,
  height: 630,
  format: 'webp',
  quality: 80,
});
useSeoMeta({
  twitterTitle: blog?.value?.seo?.title || blog?.value?.title || '',
  twitterDescription: blog?.value?.seo?.description || '',
  ogImage: previewSocial,
  twitterImage: previewSocial
})

// Prepare link array for head
let headLinks: any = [];
// add favicon
headLinks.push({ rel: 'icon', type: 'image/png', href: '/favicon.png' });

// Add canonical URL
if (blog.value) {
  const baseUrl = config.public.siteUrl || config.public.baseUrl || 'https://blog.onelitefeather.net';
  // Ensure we use the correct hreflang for the current locale (prefer ISO)
  const currentLocaleObj = (locales.value || []).find(l => typeof l === 'object' && (l as any).code === locale.value) as any || {};
  const currentHreflang = currentLocaleObj.iso || currentLocaleObj._hreflang || locale.value;
  // Ensure canonical includes blog path segment for proper SEO structure
  const canonicalUrl = `${baseUrl}/${locale.value}/blog/${blog.value.slug}`;

  // Self-referencing canonical (each language page should canonicalize to itself)
  headLinks.push({ rel: 'canonical', href: canonicalUrl });

  // Add self hreflang (important to avoid duplicate detection)
  headLinks.push({ rel: 'alternate', hreflang: currentHreflang, href: canonicalUrl });

  // Add alternate language links
  for (const alt of alternateLanguages.value) {
    headLinks.push({ rel: 'alternate', hreflang: alt.locale, href: alt.url });
  }

  // Add x-default hreflang (pointing to the default locale version)
  const defaultLocale = 'de'; // As specified in nuxt.config.ts
  if (locale.value === defaultLocale) {
    headLinks.push({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl });
  } else {
    // Find the default locale URL in alternateLanguages or build it
    const defaultLocaleUrl = (alternateLanguages.value.find(alt => alt.locale?.startsWith('de') || alt.locale === 'de')?.url)
      || `${baseUrl}/${defaultLocale}/${blog.value.slug}`;
    headLinks.push({ rel: 'alternate', hreflang: 'x-default', href: defaultLocaleUrl });
  }
}

// Use a single useHead call to set links (and merge with any useSeoMeta output)
useHead({ link: headLinks } as any)
useHead(blog.value?.head as any || {})

const title = computed(() => {
  if (getFeatureFlag('alternative-title-conversion').value === 'test') {
    return blog?.value?.alternativeTitle || blog?.value?.title || t('layouts.title');
  } else {
    return blog?.value?.title || t('layouts.title');
  }
});
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 md:px-6 py-6 md:py-8">
    <article
      v-if="blog"
      class="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-600"
      role="article"
      :aria-labelledby="'article-title'"
    >
      <NuxtImg v-if="blog?.headerImage"
               :src="blog?.headerImage"
               :alt="blog?.headerImageAlt || blog?.title || ''"
               sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
               width='1920px'
               height='1080px'
               fit='cover'
               format='webp'
               quality='80'
               class="aspect-video object-cover w-full" />
      <div class="p-6 md:p-8">
        <h1 id="article-title" class="text-4xl/10 font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{{ title }}</h1>
        <time
          v-if="blog?.pubDate"
          class="mt-1 block text-sm text-neutral-600 dark:text-neutral-400"
          :datetime="new Date(blog?.pubDate as any).toISOString()"
        >
          <i18n-d :value="blog?.pubDate"></i18n-d>
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
