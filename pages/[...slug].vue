<script setup lang="ts">
import {definePageMeta} from "#imports";
import SocialMediaShare from "~/components/blog/SocialMediaShare.vue";
const { locale, t, locales } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

definePageMeta({
  layout: 'blog-entry',
});

const pathParts = route.path.split('/');
const { data: article} = await useAsyncData(route.path, () => {
  // @ts-ignore
  return queryCollection('blog_'+locale?.value || 'blog_de').where("slug", "=", pathParts.at(2)).first();
});

// Find translations in other languages if translationKey exists
const alternateLanguages = ref<{locale: string, url: string}[]>([]);
if (article.value?.translationKey) {
  const otherLocales = (locales.value || []).filter(l => typeof l === 'object' && l.code !== locale.value);

  for (const otherLocale of otherLocales) {
    if (typeof otherLocale === 'object') {
      const { data: translatedArticle } = await useAsyncData(`${route.path}_${otherLocale.code}`, () => {
        // @ts-ignore
        return queryCollection(`blog_${otherLocale.code}`).where("translationKey", "=", article.value?.translationKey).first();
      });

      if (translatedArticle.value) {
        const baseUrl = config.public.siteUrl || 'https://blog.onelitefeather.net';
        alternateLanguages.value.push({
          locale: otherLocale.code,
          url: `${baseUrl}/${otherLocale.code}/${translatedArticle.value.slug}`
        });
      }
    }
  }
}
useSeoMeta(article.value?.seo || {
})
const img = useImage()
const previewSocial = img(article.value?.headerImage || 'logo.svg', {
  width: 1200,
  height: 630,
  format: 'webp',
  quality: 80,
});
useSeoMeta({
  twitterTitle: article?.value?.seo?.title || article?.value?.title || '',
  twitterDescription: article?.value?.seo?.description || '',
  ogImage: previewSocial,
  twitterImage: previewSocial
})

// Prepare link array for head
const headLinks = [
  {
    rel: 'icon',
    type: 'image/png',
    href: '/favicon.png'
  }
];

// Add canonical URL
if (article.value) {
  const baseUrl = config.public.siteUrl || 'https://blog.onelitefeather.net';
  const canonicalUrl = `${baseUrl}/${locale.value}/${article.value.slug}`;

  headLinks.push({
    rel: 'canonical',
    href: canonicalUrl
  });

  // Add alternate language links
  for (const alt of alternateLanguages.value) {
    headLinks.push({
      rel: 'alternate',
      hreflang: alt.locale,
      href: alt.url
    });
  }

  // Add x-default hreflang (pointing to the default locale version)
  const defaultLocale = 'de'; // As specified in nuxt.config.ts
  if (locale.value === defaultLocale) {
    headLinks.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: canonicalUrl
    });
  } else {
    // Find the default locale URL in alternateLanguages
    const defaultLocaleUrl = alternateLanguages.value.find(alt => alt.locale === defaultLocale)?.url;
    if (defaultLocaleUrl) {
      headLinks.push({
        rel: 'alternate',
        hreflang: 'x-default',
        href: defaultLocaleUrl
      });
    }
  }
}

useHead({
  link: headLinks
})
useHead(article?.value?.head || {})
</script>

<template>
  <div class="container mx-auto py-4">
    <article v-if="article" class="bg-white dark:bg-gray-800 rounded-xxl shadow-md overflow-hidden">
      <NuxtImg v-if="article?.headerImage"
               :src="article?.headerImage"
               :alt="article?.headerImageAlt"
               sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
               width='1920px'
               height='1080px'
               fit='cover'
               format='webp'
               quality='80'
               class="aspect-video object-cover rounded-lg" />
      <div class="p-4">
        <time v-if="article?.pubDate" class="text-sm text-gray-500 dark:text-gray-400"><i18n-d :value="article?.pubDate"></i18n-d></time>
        <ContentRenderer class="text-gray-700 dark:text-gray-300 mt-2" :value="article">
        </ContentRenderer>

        <!-- Social Media Sharing Buttons -->
        <div class="mt-6">
          <SocialMediaShare 
            :url="config.public.siteUrl + '/' + locale.value + '/' + article.slug" 
            :title="article.title" 
            :description="article.description || ''" 
            :is-large-page="['alles-was-man-ueber-ethanol-wissen-sollte', 'riding-the-rollercoaster-of-automation-with-proxmox-and-ansible', 'plugins-open-for-adoption', 'effizientes-logging-in-paper-plugins', 'dev-blog-1'].includes(article.slug)"
          />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>

</style>
