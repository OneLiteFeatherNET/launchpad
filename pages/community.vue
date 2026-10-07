<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()

definePageMeta({
  layout: 'default'
})

const { overview, numbers } = useCommunityOverview()

usePageSeo({
  title: t('community.title'),
  description: t('community.description'),
  schemaType: 'CollectionPage',
  keywords: [
    'OneLiteFeather community',
    'Minecraft Community',
    'Minecraft Server Community',
    'OneLiteFeather Discord'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('community.title') }
])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <header class="mb-8">
      <h1 class="text-display-small font-bold text-on-surface">
        {{ t('community.title') }}
      </h1>
      <p class="mt-3 max-w-3xl text-body-large text-on-surface-variant">
        {{ t('community.intro') }}
      </p>
    </header>

    <section :aria-label="t('community.stats.aria')">
      <CommunityStats :numbers="numbers" />
    </section>

    <CommunityWall class="mt-12" :contributors="overview.contributors" />
  </div>
</template>
