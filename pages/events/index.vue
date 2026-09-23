<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()
const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'default'
})

const { events } = useEventsOverview()

const discordUrl = (runtimeConfig.public?.discordUrl as string | undefined)
  || 'https://1lf.link/discord'

usePageSeo({
  title: t('events.title'),
  description: t('events.description'),
  schemaType: 'CollectionPage'
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('events.title') }
])

useSchemaOrg(() => {
  const list = [...events.value.current,
...events.value.upcoming,
...events.value.past]
  if (!list.length) return []
  return [
    {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((card, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        url: new URL(card.path, site.url).toString(),
        name: card.title
      }))
    }
  ]
})
</script>

<template>
  <div class="container mx-auto max-w-screen-xl space-y-12 px-4 py-8 md:px-6 md:py-12">
    <header class="max-w-3xl">
      <h1 class="text-headline-large text-on-surface">{{ t('events.title') }}</h1>
      <p class="mt-3 text-body-large text-on-surface-variant">{{ t('events.intro') }}</p>
    </header>

    <EventSection
      id="events-current"
      :title="t('events.sections.current')"
      :events="events.current"
      :empty-text="t('events.empty_current')"
      :empty-action-label="t('events.empty_action')"
      :empty-action-href="discordUrl"
    />
    <EventSection
      id="events-upcoming"
      :title="t('events.sections.upcoming')"
      :events="events.upcoming"
    />
    <EventSection id="events-past" :title="t('events.sections.past')" :events="events.past" />
  </div>
</template>
