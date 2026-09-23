<script setup lang="ts">
import { computed, definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { poi } = await useCommunityPoiDetail()


const title = computed(() => poi.value?.title || t('community_poi.overview.title'))
const description = computed(() => poi.value?.summary || t('community_poi.overview.description'))

usePageSeo({
  title: title.value,
  description: description.value,
  image: poi.value?.thumbnail,
  imageAlt: poi.value?.thumbnailAlt,
  ogType: 'article',
  // The build itself is the CreativeWork node defined below; the page is the
  // page about it.
  schemaType: 'ItemPage'
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` },
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

const backLinkClass
  = 'rounded-extra-small text-label-large text-primary underline-offset-2 hover:underline focus-ring'

const heroImgClass = 'aspect-[16/9] w-full rounded-large object-cover shadow-elevation-1'

const titleClass = 'text-display-small font-bold text-on-surface'

const progressSectionClass = 'rounded-large bg-surface-container-low p-5'
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 py-6 md:px-6 md:py-10">
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
          <span v-if="poi.location" class="text-body-medium text-on-surface-variant">
            {{ poi.location }}
          </span>
        </div>
        <h1 :class="titleClass">{{ poi.title }}</h1>
        <p class="text-body-large text-on-surface-variant">{{ poi.summary }}</p>
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
        class="rounded-large border border-outline-variant p-5"
      >
        <CommunityPoiMeta :poi="poi" />
      </section>

      <LazyCommunityPoiBluemap
        v-if="poi.coordinates"
        :title="poi.title"
        :coordinates="poi.coordinates"
      />

      <!--
        Rendered by the content-core Prose* components; the `prose` classes
        this carried compiled to nothing (no typography plugin).
      -->
      <section v-if="poi.body">
        <ContentRenderer :value="poi" />
      </section>

      <section v-if="poi.gallery?.length">
        <h2 class="mb-3 text-title-large text-on-surface">
          {{ t('community_poi.gallery.title') }}
        </h2>
        <LazyMediaGallery :images="poi.gallery" :label="t('community_poi.gallery.aria')" />
      </section>

      <section v-if="poi.schematics?.length" class="space-y-4">
        <h2 class="mb-3 text-title-large text-on-surface">
          {{ t('community_poi.schematics.title') }}
        </h2>
        <LazyCommunityPoiSchematics :schematics="poi.schematics" />
        <LazyCommunityPoiLitematicaHelp />
      </section>

      <LazyCommunityPoiCollaboration :poi="poi" />
    </article>
  </div>
</template>
