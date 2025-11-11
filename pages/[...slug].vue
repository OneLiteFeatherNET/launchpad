<script setup lang="ts">
import {definePageMeta} from "#imports";
import SocialMediaShare from "~/components/blog/SocialMediaShare.vue";
const { locale, t, locales } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const {getFeatureFlag } = usePostHogFeatureFlag();

definePageMeta({
  layout: 'blog-entry',
});

const pathParts = route.path.split('/');
const { data: article} = await useAsyncData(route.path, () => {
  // @ts-ignore
  return queryCollection('blog_'+locale?.value || 'blog_de').where("slug", "=", pathParts.at(2)).first();
});

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
          url: `${baseUrl}/${otherLocale.code}/${(translatedArticle.value as any).slug}`
        });
      }
    }
  }
}
useSeoMeta(blog.value?.seo || {
})
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
  const canonicalUrl = `${baseUrl}/${locale.value}/${blog.value.slug}`;

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
    return blog?.value?.alternativeTitle || blog?.value?.title || 'No Title';
  } else {
    return blog?.value?.title || 'No Title';
  }
});
</script>

<template>
  <div class="container mx-auto py-4">
    <article v-if="blog" class="bg-white dark:bg-gray-800 rounded-xxl shadow-md overflow-hidden">
      <NuxtImg v-if="blog?.headerImage"
               :src="blog?.headerImage"
               :alt="blog?.headerImageAlt"
               sizes='xs:300px sm:500px md:700px lg:1200px xl:1920px'
               width='1920px'
               height='1080px'
               fit='cover'
               format='webp'
               quality='80'
               class="aspect-video object-cover rounded-lg w-[48rem] place-self-center" />
      <div class="p-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
        <time v-if="blog?.pubDate" class="text-sm text-gray-500 dark:text-gray-400"><i18n-d :value="blog?.pubDate"></i18n-d></time>
        <ContentRenderer class="text-gray-700 dark:text-gray-300 mt-2" :value="blog">
        </ContentRenderer>

        <!-- Social Media Sharing Buttons -->
        <div class="mt-6">
          <SocialMediaShare 
            :url="config.public.siteUrl + '/' + locale.value + '/' + (blog?.slug || '')"
            :title="blog?.title"
            :description="blog?.description || ''"
            :is-large-page="['alles-was-man-ueber-ethanol-wissen-sollte', 'riding-the-rollercoaster-of-automation-with-proxmox-and-ansible', 'plugins-open-for-adoption', 'effizientes-logging-in-paper-plugins', 'dev-blog-1'].includes(blog?.slug)"
          />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>

</style>
