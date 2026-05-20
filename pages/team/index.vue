<script setup lang="ts">
import { definePageMeta } from '#imports'
import TeamRankSection from '~/components/features/team/TeamRankSection.vue'
import TeamFaqSection from '~/components/features/team/TeamFaqSection.vue'

const { t, locale } = useI18n()
const site = useSiteConfig()

definePageMeta({
  layout: 'default'
})

const { groups, memberCount } = useTeamRoster()

usePageSeo({
  title: t('team.index.title'),
  description: t('team.index.description'),
  schemaType: 'CollectionPage',
  keywords: [
    'OneLiteFeather team',
    'OneLiteFeather staff',
    'Minecraft network team',
    'join OneLiteFeather'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}/` }, { name: t('team.title') }
])

// Expose the roster as an ItemList of Person entities. The stable per-member
// `@id` matches the one used on the individual profile page and in
// Article.author, so Google can merge them into one identity.
useSchemaOrg(() => {
  const members = groups.value.flatMap((g) => g.members)
  if (!members.length) return []
  return [
    {
      '@type': 'ItemList',
      numberOfItems: members.length,
      itemListElement: members.map((m, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        url: m.slug
          ? personProfileUrl(site.url, locale.value, m.slug)
          : new URL(`/${locale.value}/team/`, site.url).toString(),
        name: m.name
      }))
    }
  ]
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <header class="mb-8 text-center">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {{ t('team.index.title') }}
      </h1>
      <p class="mx-auto mt-3 max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400">
        {{ t('team.index.subtitle') }}
      </p>
    </header>

    <TeamRankSection
      v-for="group in groups"
      :key="group.rank"
      :group="group"
    />

    <p
      v-if="memberCount === 0"
      class="mt-10 text-center text-gray-600 dark:text-gray-400"
    >
      {{ t('team.no_results') }}
    </p>

    <TeamFaqSection />
  </main>
</template>
