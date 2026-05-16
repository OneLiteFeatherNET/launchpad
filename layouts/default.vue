<script setup lang="ts">
import { unref } from 'vue'
import LayoutNavigationBar from '~/components/features/navigation/NavigationBar.vue'
import LayoutFooter from '~/components/features/footer/Footer.vue'

const route = useRoute()
const { t } = useI18n()

// Single source of truth for canonical + hreflang + og:locale across the
// whole app. Driven by @nuxtjs/i18n (incl. translated blog slugs via
// useSetI18nParams), so individual composables no longer hand-roll their
// own canonical/alternate links — that previously produced duplicate /
// conflicting hreflang tags that Google flagged.
const head = useLocaleHead({ dir: true, lang: true, seo: true })
useHead(() => {
  const h = unref(head)
  return { link: h?.link ?? [], meta: h?.meta ?? [] }
})
// Only set a static <Title> when the route explicitly provides one via meta.
const routeTitle = computed(() => (route.meta?.title ? t(route.meta.title as string) : null))

// Expose the main navigation as schema.org SiteNavigationElement so Google
// has a structured signal when picking SERP sitelinks.
useSiteNavigationSchema()
</script>

<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
  <Head>
    <Title v-if="routeTitle">{{ routeTitle }}</Title>
  </Head>
    <Body class="dark:bg-gray-900 overflow-x-hidden">
      <!-- Local wrapper ensures flex layout even if <Body> classes are not applied by the renderer -->
      <div class="min-h-screen flex flex-col">
        <LayoutNavigationBar />
        <main class="px-4 mx-auto sm:px-6 lg:px-8 w-full flex-1">
          <slot/>
        </main>
        <LayoutFooter />
      </div>
    </Body>
  </Html>
</template>

<style scoped>

</style>
