<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()
const { discordUrl } = useRuntimeConfig().public

definePageMeta({
  layout: 'default'
})

const { about } = await useAbout()
const { numbers } = useCommunityOverview()

usePageSeo({
  title: t('about.title'),
  description: t('about.description'),
  schemaType: 'AboutPage',
  keywords: [
    'OneLiteFeather',
    'Über uns',
    'About us',
    'Minecraft Netzwerk',
    'Minecraft Network'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('about.title') }
])

// Refines the page node usePageSeo set up; the organization is the one
// declared by the site identity, never a second node.
useSchemaOrg([
  defineWebPage({
    about: { '@id': `${site.url}/#identity` }
  })
])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <header class="mb-10">
      <h1 class="text-display-small font-bold text-on-surface">
        {{ t('about.title') }}
      </h1>
    </header>

    <section v-if="about" aria-labelledby="about-who">
      <h2 id="about-who" class="text-headline-medium font-bold text-on-surface">
        {{ t('about.sections.who') }}
      </h2>
      <p class="mt-3 max-w-3xl text-body-large text-on-surface-variant">
        {{ about.who }}
      </p>
    </section>

    <section v-if="about?.pillars.length" class="mt-12" aria-labelledby="about-pillars">
      <h2 id="about-pillars" class="mb-5 text-headline-medium font-bold text-on-surface">
        {{ t('about.sections.pillars') }}
      </h2>
      <AboutPillars :pillars="about.pillars" />
    </section>

    <CommunityStrip class="!px-0" :numbers="numbers" :to="`/${locale}/community`" />

    <section v-if="about" class="mt-4" aria-labelledby="about-work">
      <h2 id="about-work" class="text-headline-medium font-bold text-on-surface">
        {{ t('about.sections.work') }}
      </h2>
      <p class="mt-3 max-w-3xl text-body-large text-on-surface-variant">
        {{ about.work }}
      </p>
    </section>

    <section v-if="about" class="mt-12" aria-labelledby="about-join">
      <h2 id="about-join" class="text-headline-medium font-bold text-on-surface">
        {{ t('about.sections.join') }}
      </h2>
      <p class="mt-3 mb-5 max-w-3xl text-body-large text-on-surface-variant">
        {{ about.join }}
      </p>
      <AboutJoin :discord-url="discordUrl" />
    </section>
  </div>
</template>
