<script setup lang="ts">
import { defineAsyncComponent, definePageMeta } from '#imports'
import CommunityPoiGrid from '~/components/features/community-poi/CommunityPoiGrid.vue'

const LazyContribute = defineAsyncComponent(() => import('~/components/features/community-poi/CommunityPoiContributeInfo.vue'))

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { pois, total } = useCommunityPoiOverview()

usePageSeo({
  title: t('community_poi.overview.title'),
  description: t('community_poi.overview.description'),
  schemaType: 'CollectionPage',
  keywords: [
    'OneLiteFeather community',
    'Minecraft Point of Interest',
    'Minecraft Community Bauten',
    'Litematica Schematics',
    'Minecraft Bauprojekte'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}/` }, { name: t('community_poi.overview.title') }
])

useSchemaOrg(() => {
  const list = pois.value || []
  if (!list.length) return []
  return [
    {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((poi, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        url: new URL(`/${locale.value}/community-poi/${poi.slug}`, site.url).toString(),
        name: poi.title
      }))
    }
  ]
})
</script>

<template>
  <main class="container mx-auto max-w-screen-xl px-4 py-8 md:px-6 md:py-12">
    <header class="mb-8 max-w-3xl">
      <h1
        class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl"
      >
        {{ t('community_poi.overview.title') }}
      </h1>
      <p class="mt-3 text-base text-neutral-700 dark:text-neutral-300">
        {{ t('community_poi.overview.description') }}
      </p>
      <p v-if="total" class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {{ t('community_poi.overview.count', { count: total }) }}
      </p>
    </header>

    <CommunityPoiGrid :pois="pois" />

    <div class="mt-10">
      <LazyContribute />
    </div>
  </main>
</template>
