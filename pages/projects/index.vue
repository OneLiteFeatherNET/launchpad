<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { projects } = await useProjectsOverview()

usePageSeo({
  title: t('projects.overview.title'),
  description: t('projects.overview.description'),
  schemaType: 'CollectionPage',
  keywords: [
    'OneLiteFeather Projekte',
    'OneLiteFeather projects',
    'Minecraft Plugin',
    'Paper Plugin'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('projects.overview.title') }
])

useSchemaOrg(computed(() => {
  const list = projects.value
  if (!list.length) return []
  return [
    {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((project, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        url: new URL(`/${locale.value}/projects/${project.slug}`, site.url).toString(),
        name: project.title
      }))
    }
  ]
}))
</script>

<template>
  <div class="container mx-auto max-w-screen-xl px-4 py-8 md:px-6 md:py-12">
    <header class="mb-8 max-w-3xl">
      <h1 class="text-display-small font-bold text-on-surface">
        {{ t('projects.overview.title') }}
      </h1>
      <p class="mt-3 text-body-large text-on-surface-variant">
        {{ t('projects.overview.description') }}
      </p>
    </header>

    <ProjectGrid :projects="projects" />
  </div>
</template>
