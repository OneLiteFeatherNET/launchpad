<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { projects } = await useProjectsOverview()

const groups = computed(() => groupProjectsByAudience(projects.value))
// Same order the page shows, so the ItemList positions match what a reader sees.
const orderedProjects = computed(() => groups.value.flatMap((group) => group.projects))

usePageSeo({
  title: t('projects.overview.title'),
  description: t('projects.overview.description'),
  image: sectionOgImage('projects', locale.value),
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
  const list = orderedProjects.value
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

    <div v-if="projects.length" class="space-y-12">
      <template v-for="group in groups" :key="group.audience">
        <section
          v-if="group.projects.length"
          :aria-labelledby="`projects-${group.audience}`"
          class="space-y-6"
        >
          <header class="max-w-3xl">
            <h2
              :id="`projects-${group.audience}`"
              class="text-headline-medium font-semibold text-on-surface"
            >
              {{ t(`projects.audience.section.${group.audience}.title`) }}
            </h2>
            <p class="mt-2 text-body-large text-on-surface-variant">
              {{ t(`projects.audience.section.${group.audience}.intro`) }}
            </p>
          </header>
          <ProjectGrid :projects="group.projects" />
        </section>
      </template>
    </div>
    <ProjectGrid v-else :projects="projects" />
  </div>
</template>
