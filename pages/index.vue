<script setup lang="ts">
import {computed, definePageMeta} from "#imports";
import type { EventSlide } from '#layers/home'

definePageMeta({
  title: 'index.title',
  layout: 'default',
});

const { t, locale } = useI18n()
const { numbers } = useCommunityOverview()
const discordUrl = String(useRuntimeConfig().public.discordUrl)
const { concept, connect, slides } = useHomeContent()
const { promoted } = useEventPromotions()

// Promoted events lead the carousel, ahead of the curated slides. Mapped here
// because this page is the one place allowed to know both the events and the
// home layer; neither of them knows the other.
const carouselSlides = computed(() => [
  ...promoted.value.map((card): EventSlide => ({
    type: 'event',
    title: card.title,
    dateStart: card.startsAt,
    dateEnd: card.endsAt,
    href: card.path,
    image: card.thumbnail,
    alt: card.thumbnailAlt,
    note: card.summary
  })),
  ...(slides.value ?? [])
])
const { sponsors } = useSponsoring()
const { data: collective } = useOpenCollective()
const { items: faqItems } = useFaqContent()
useHomeSeo({ title: t('index.title') })


// The h1 in the template is sr-only: the carousel is the visual opening and leaves no room for a heading.
// Discord ("Mitreden") and the server addresses ("Spielen") lead; reasoning in the change design.
// Sections below the carousel are lazy + hydrate-on-visible; see tests/architecture/lazy-components.spec.ts.
</script>

<template>
  <h1 class="sr-only">{{ t('index.title') }}</h1>
  <div class="-mx-4 sm:-mx-6 px-0 py-6 md:py-10 md:mx-auto md:max-w-6xl md:px-4 lg:px-8">
    <Carousel :slides="carouselSlides" aspect="16/9" :aria-label="t('index.carousel_aria')" />
  </div>
  <LazyDiscordCta hydrate-on-visible :href="discordUrl" :members="numbers.discordMembers" />
  <LazyServerAddresses
    v-if="connect"
    hydrate-on-visible
    :java-address="connect.javaAddress"
    :bedrock-host="connect.bedrockHost"
    :bedrock-port="connect.bedrockPort"
  />
  <LazyCommunityStrip hydrate-on-visible :numbers="numbers" :to="`/${locale}/community`" />
  <LazyServerConcept
    v-if="concept"
    hydrate-on-visible
    :title="concept.title"
    :subtitle="concept.subtitle"
    :points="concept.points || []"
  />
  <LazySponsoring v-if="sponsors?.length" hydrate-on-visible :sponsors="sponsors" />
  <LazyOpenCollectiveStats
    v-if="collective"
    hydrate-on-visible
    :total-raised="collective.totalRaised"
    :goal="collective.goal"
    :contributors="collective.contributors"
    :currency="collective.currency"
    :link="collective.link"
    :updated-at="collective.updatedAt"
  />
  <LazyFaqSection hydrate-on-visible :items="faqItems" />
</template>
