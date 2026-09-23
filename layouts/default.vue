<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

// <html lang/dir>, canonical, hreflang and og:locale come from @nuxtjs/i18n
// itself (`experimental.strictSeo` in nuxt.config.ts), driven by the
// translated slugs pages publish through useSetI18nParams. Nothing here or in
// the SEO composables writes canonical or alternate links.
// Only set a static <Title> when the route explicitly provides one via meta.
// `title` is declared in types/page-meta.d.ts, so the compiler holds the pages
// that set it to the same string contract this line relies on.
const routeTitle = computed(() => (route.meta?.title ? t(route.meta.title) : null))

// Expose the main navigation as schema.org SiteNavigationElement so Google
// has a structured signal when picking SERP sitelinks.
useSiteNavigationSchema()
</script>

<template>
  <Html>
  <Head>
    <Title v-if="routeTitle">{{ routeTitle }}</Title>
  </Head>
    <Body class="overflow-x-hidden bg-surface text-on-surface">
      <!-- Local wrapper ensures flex layout even if <Body> classes are not applied by the renderer -->
      <div class="min-h-screen flex flex-col">
        <a href="#main-content" class="skip-link">{{ t('accessibility.skip_to_content') }}</a>
        <NavigationBar />
        <main id="main-content" tabindex="-1" class="px-4 mx-auto sm:px-6 lg:px-8 w-full flex-1 focus:outline-none">
          <slot/>
        </main>
        <SiteFooter />
      </div>
    </Body>
  </Html>
</template>

<style scoped>

</style>
