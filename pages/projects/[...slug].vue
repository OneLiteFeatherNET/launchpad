<script setup lang="ts">
import { computed, definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { detail } = await useProjectDetail()

const project = computed(() => detail.value?.project)
const maintainers = computed(() => detail.value?.maintainers ?? [])
const title = computed(() => project.value?.title || t('projects.overview.title'))
const description = computed(() => project.value?.summary || t('projects.overview.description'))

// The join with community POIs happens here: neither layer knows the other.
const { pois } = await useCommunityPoisByProject(computed(() => project.value?.slug ?? ''))

usePageSeo({
  title: title.value,
  description: description.value,
  image: project.value?.logo,
  imageAlt: project.value?.logoAlt,
  ogType: 'article',
  schemaType: 'ItemPage'
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` },
  { name: t('projects.overview.title'), url: `/${locale.value}/projects` },
  { name: title.value }
])

const toIso = (raw: string | Date | undefined): string | undefined => {
  if (!raw) return undefined
  const date = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

useSchemaOrg(computed(() => {
  if (!project.value) return []
  const url = new URL(`/${locale.value}/projects/${project.value.slug}`, site.url).toString()
  const links = project.value.links
  return [
    {
      '@type': 'SoftwareApplication',
      '@id': `${url}#software`,
      name: project.value.title,
      description: project.value.summary,
      url,
      license: project.value.license,
      datePublished: toIso(project.value.releasedAt as string | Date | undefined),
      softwareHelp: links?.docs,
      downloadUrl: links?.downloads?.[0]?.url,
      publisher: { '@id': organizationId(site.url) }
    }
  ]
}))

useHead(() => (project.value as { head?: Record<string, unknown> } | null)?.head || {})

const resources = computed(() => {
  const links = project.value?.links
  if (!links) return []
  const named = [
    { key: 'docs', url: links.docs },
    { key: 'source', url: links.source },
    { key: 'issues', url: links.issues }
  ].flatMap(({ key, url }) => (url
    ? [{ kind: 'link' as const, name: t(`projects.links.${key}`), url }]
    : []))
  const downloads = (links.downloads ?? []).map((download) => ({
    kind: 'download' as const,
    name: download.label,
    url: download.url
  }))
  return [...named, ...downloads]
})

const releasedAt = computed(() => project.value?.releasedAt as string | Date | undefined)
const platforms = computed(() => (project.value?.platforms ?? []).join(', '))

const backLinkClass
  = 'rounded-extra-small text-label-large text-primary underline-offset-2 hover:underline focus-ring'
const factLabelClass = 'text-label-medium text-on-surface-variant'
const factValueClass = 'text-body-large text-on-surface'
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 py-6 md:px-6 md:py-10">
    <article v-if="project" class="space-y-8">
      <header class="space-y-4">
        <p class="text-sm">
          <NuxtLink :to="`/${locale}/projects`" :class="backLinkClass">
            ← {{ t('projects.detail.back') }}
          </NuxtLink>
        </p>
        <div class="flex items-center gap-4">
          <NuxtPicture
            v-if="project.logo"
            :src="project.logo"
            :alt="project.logoAlt ?? ''"
            width="96"
            height="96"
            fit="contain"
            format="avif,webp"
            :img-attrs="{ class: 'size-24 rounded-large object-contain' }"
          />
          <ProjectStatusBadge :status="project.status" />
        </div>
        <h1 class="text-display-small font-bold text-on-surface">{{ project.title }}</h1>
        <p class="text-body-large text-on-surface-variant">{{ project.summary }}</p>
      </header>

      <ResourceList
        v-if="resources.length"
        :resources="resources"
        :label="t('projects.detail.links_aria')"
      />

      <section v-if="project.body">
        <ContentRenderer :value="project" />
      </section>

      <section
        v-if="platforms || project.license || releasedAt"
        aria-labelledby="project-facts"
        class="space-y-3"
      >
        <h2 id="project-facts" class="text-title-large text-on-surface">
          {{ t('projects.detail.facts') }}
        </h2>
        <dl class="grid gap-x-8 gap-y-4 sm:grid-cols-3">
          <div v-if="platforms">
            <dt :class="factLabelClass">{{ t('projects.detail.platforms') }}</dt>
            <dd :class="factValueClass">{{ platforms }}</dd>
          </div>
          <div v-if="project.license">
            <dt :class="factLabelClass">{{ t('projects.detail.license') }}</dt>
            <dd :class="factValueClass">{{ project.license }}</dd>
          </div>
          <div v-if="releasedAt">
            <dt :class="factLabelClass">{{ t('projects.detail.released') }}</dt>
            <dd :class="factValueClass">
              <DateRange :start="releasedAt" :with-time="false" />
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="maintainers.length" aria-labelledby="project-maintainers" class="space-y-3">
        <h2 id="project-maintainers" class="text-title-large text-on-surface">
          {{ t('projects.detail.maintainers') }}
        </h2>
        <div class="flex flex-wrap gap-x-8 gap-y-4">
          <PersonLink
            v-for="person in maintainers"
            :key="person.slug"
            :name="person.name"
            :to="person.profilePath"
            :avatar="person.avatar"
            :role="person.role"
          />
        </div>
      </section>

      <section v-if="pois.length" aria-labelledby="project-in-use" class="space-y-3">
        <h2 id="project-in-use" class="text-title-large text-on-surface">
          {{ t('projects.detail.in_use') }}
        </h2>
        <p class="text-body-medium text-on-surface-variant">
          {{ t('projects.detail.in_use_intro') }}
        </p>
        <CommunityPoiGrid :pois="pois" />
      </section>
    </article>
  </div>
</template>
