<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()
const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'default'
})

const { projects } = await useProjectsOverview()

const facets = computed(() => platformFacets(projects.value))

// Read after mount only: the cached server render must not depend on the request
// (request-independent-render.spec.ts), so the server renders every project.
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})

const filter = computed<ProjectFilter>(() => {
  if (!hydrated.value) return EMPTY_PROJECT_FILTER
  const query = new URL(route.fullPath, 'http://localhost').searchParams
  return parseProjectFilter(query, facets.value.map((facet) => facet.platform))
})

const setFilter = (next: ProjectFilter) => {
  router.replace({ query: serializeProjectFilter(next) })
}

const groups = computed(() => groupProjectsByAudience(projects.value))
const visibleGroups = computed(() => {
  return groupProjectsByAudience(filterProjects(projects.value, filter.value))
})
const visibleCount = computed(() => {
  return visibleGroups.value.reduce((sum, group) => sum + group.projects.length, 0)
})
// Every project, whatever the filter, in the order the unfiltered page shows,
// so the ItemList positions match what a reader sees.
const orderedProjects = computed(() => groups.value.flatMap((group) => group.projects))

const emptyClass
  = 'rounded-large border border-dashed border-outline-variant p-8 text-center '
    + 'text-body-medium text-on-surface-variant'

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
      <ProjectFilters
        :filter="filter"
        :facets="facets"
        :shown="visibleCount"
        :total="projects.length"
        @update:filter="setFilter"
      />

      <p v-if="!visibleCount" :class="emptyClass">
        {{ t('projects.filter.empty') }}
      </p>

      <template v-for="group in visibleGroups" :key="group.audience">
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
