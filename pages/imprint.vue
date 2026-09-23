<script setup lang="ts">
import {definePageMeta} from "#imports";
const { t, locale } = useI18n()

definePageMeta({
  title: 'blog.imprint.title',
});

usePageSeo({
  // Without this, usePageSeo falls back to the site name and overwrites
  // <title>, og:title and twitter:title with it — the definePageMeta title
  // above never reaches any of the three.
  title: t('blog.imprint.title'),
  description: t('blog.imprint.description'),
  robots: 'noindex, follow',
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('blog.imprint.title') }
])
</script>

<template>
  <div class="container mx-auto py-4 text-body-large text-on-surface">
    <!-- Visible here: the page opened straight into an address block with no
         heading at all, which is a gap for sighted readers too. -->
    <h1 class="mb-4 text-headline-medium font-bold">{{ t('blog.imprint.title') }}</h1>
    <div class="space-y-2">
      <p class="font-semibold">Phillipp Glanz</p>
      <p>Geisinger Straße 6</p>
      <p>71634 Ludwigsburg</p>
      <p>
        <span class="font-semibold">Mail:</span>
        <a
          href="mailto:contact@onelitefeather.net"
          class="rounded-extra-small text-primary underline underline-offset-2 focus-ring"
        > contact@onelitefeather.net</a>
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
