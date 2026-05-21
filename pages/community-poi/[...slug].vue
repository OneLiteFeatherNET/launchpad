<script setup lang="ts">
import { computed, defineAsyncComponent, definePageMeta } from '#imports'
import CommunityPoiStatusBadge from '~/components/features/community-poi/CommunityPoiStatusBadge.vue'
import CommunityPoiCategoryBadge from '~/components/features/community-poi/CommunityPoiCategoryBadge.vue'
import CommunityPoiProgressBar from '~/components/features/community-poi/CommunityPoiProgressBar.vue'
import CommunityPoiMeta from '~/components/features/community-poi/CommunityPoiMeta.vue'
import CommunityPoiGoalState from '~/components/features/community-poi/CommunityPoiGoalState.vue'
import CommunityPoiLore from '~/components/features/community-poi/CommunityPoiLore.vue'

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { poi } = await useCommunityPoiDetail()

const LazyGallery = defineAsyncComponent(() => import('~/components/features/community-poi/CommunityPoiGallery.vue'))
const LazySchematics = defineAsyncComponent(() => import('~/components/features/community-poi/CommunityPoiSchematicList.vue'))
const LazyLitematicaHelp = defineAsyncComponent(() => import('~/components/features/community-poi/CommunityPoiLitematicaHelp.vue'))
const LazyBluemap = defineAsyncComponent(() => import('~/components/features/community-poi/CommunityPoiBluemap.vue'))
const LazyCollaboration = defineAsyncComponent(() => import('~/components/features/community-poi/CommunityPoiCollaboration.vue'))

const title = computed(() => poi.value?.title || t('community_poi.overview.title'))
const description = computed(() => poi.value?.summary || t('community_poi.overview.description'))

usePageSeo({
  title: title.value,
  description: description.value,
  image: poi.value?.thumbnail,
  imageAlt: poi.value?.thumbnailAlt,
  ogType: 'article',
  schemaType: 'CreativeWork'
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}/` },
  { name: t('community_poi.overview.title'), url: `/${locale.value}/community-poi/` },
  { name: title.value }
])

const toIso = (raw: string | Date | undefined): string | undefined => {
  if (!raw) return undefined
  const date = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

useSchemaOrg(() => {
  if (!poi.value) return []
  const detailUrl = new URL(
    `/${locale.value}/community-poi/${poi.value.slug}`,
    site.url
  ).toString()
  const coords = poi.value.coordinates
  const nodes: Array<Record<string, unknown>> = [
    {
      '@type': 'CreativeWork',
      '@id': `${detailUrl}#creativework`,
      name: poi.value.title,
      description: poi.value.summary,
      url: detailUrl,
      dateCreated: toIso(poi.value.startedAt as string | Date | undefined),
      dateModified: toIso(poi.value.updatedAt as string | Date | undefined),
      image: poi.value.thumbnail || undefined,
      author: (poi.value.builders || []).map((b) => ({ '@type': 'Person' as const, name: b.name }))
    }
  ]
  if (coords) {
    // Game-world coordinates are not real GPS positions, but schema.org's
    // Place type still gives Google a richer entity to attach to the page.
    nodes.push({
      '@type': 'Place',
      '@id': `${detailUrl}#place`,
      name: poi.value.location || poi.value.title,
      url: detailUrl,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'minecraft:x', value: coords.x },
        ...(coords.y !== undefined
          ? [{ '@type': 'PropertyValue', name: 'minecraft:y', value: coords.y }]
          : []),
        { '@type': 'PropertyValue', name: 'minecraft:z', value: coords.z },
        ...(coords.dimension
          ? [{ '@type': 'PropertyValue', name: 'minecraft:dimension', value: coords.dimension }]
          : [])
      ]
    })
  }
  return nodes
})

useHead(() => (poi.value as { head?: Record<string, unknown> } | null)?.head || {})

const backLinkClass = [
  'text-[var(--color-brand-secondary)] underline-offset-2 hover:underline',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)]'
].join(' ')

const heroImgClass = [
  'aspect-[16/9] w-full rounded-xl object-cover shadow-sm', 'ring-1 ring-black/5 dark:ring-white/10'
].join(' ')

const titleClass = [
  'text-3xl font-bold tracking-tight md:text-4xl', 'text-neutral-900 dark:text-neutral-50'
].join(' ')

const progressSectionClass = [
  'rounded-lg bg-neutral-50 p-5 ring-1 ring-black/5', 'dark:bg-neutral-900 dark:ring-white/10'
].join(' ')
</script>

<template>
  <main class="container mx-auto max-w-screen-lg px-4 py-6 md:px-6 md:py-10">
    <article v-if="poi" class="space-y-8">
      <header class="space-y-4">
        <p class="text-sm">
          <NuxtLink :to="`/${locale}/community-poi/`" :class="backLinkClass">
            ← {{ t('community_poi.detail.back') }}
          </NuxtLink>
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <CommunityPoiStatusBadge :status="poi.status" />
          <CommunityPoiCategoryBadge v-if="poi.category" :category="poi.category" />
          <span v-if="poi.location" class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ poi.location }}
          </span>
        </div>
        <h1 :class="titleClass">{{ poi.title }}</h1>
        <p class="text-base text-neutral-700 dark:text-neutral-300">{{ poi.summary }}</p>
      </header>

      <NuxtPicture
        v-if="poi.thumbnail"
        :src="poi.thumbnail"
        :alt="poi.thumbnailAlt || poi.title"
        sizes="xs:300px sm:500px md:700px lg:900px"
        width="1600"
        height="900"
        fit="cover"
        quality="80"
        :img-attrs="{ class: heroImgClass }"
        format="avif,webp"
      />

      <section :aria-label="t('community_poi.progress.aria')" :class="progressSectionClass">
        <CommunityPoiProgressBar :value="poi.progress ?? 0" />
      </section>

      <CommunityPoiGoalState :goal="poi.goal" :current-state="poi.currentState" />

      <CommunityPoiLore v-if="poi.lore" :lore="poi.lore" />

      <section
        :aria-label="t('community_poi.meta.aria')"
        class="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
      >
        <CommunityPoiMeta :poi="poi" />
      </section>

      <LazyBluemap
        v-if="poi.coordinates"
        :title="poi.title"
        :coordinates="poi.coordinates"
      />

      <section v-if="poi.body" class="prose prose-neutral max-w-none dark:prose-invert">
        <ContentRenderer :value="poi" />
      </section>

      <section v-if="poi.gallery?.length">
        <h2 class="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          {{ t('community_poi.gallery.title') }}
        </h2>
        <LazyGallery :images="poi.gallery" />
      </section>

      <section v-if="poi.schematics?.length" class="space-y-4">
        <h2 class="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          {{ t('community_poi.schematics.title') }}
        </h2>
        <LazySchematics :schematics="poi.schematics" />
        <LazyLitematicaHelp />
      </section>

      <LazyCollaboration :poi="poi" />
    </article>
  </main>
</template>
