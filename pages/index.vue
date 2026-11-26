<script setup lang="ts">
import {computed, definePageMeta} from "#imports";
import { composeSlides, eventSlide } from '#layers/home'

definePageMeta({
  title: 'index.title',
  layout: 'default',
});

const { t, locale } = useI18n()
const { numbers } = useCommunityOverview()
const discordUrl = String(useRuntimeConfig().public.discordUrl)
const {
  concept,
  connect,
  slides,
  carouselLoading,
  conceptLoading,
  connectLoading
} = useHomeContent()
const { promoted, loading: promotionsLoading } = useEventPromotions()

const { highlights, loading: highlightsLoading } = useHomeHighlights()

// The carousel puts its slides in a fixed order, so it waits for all four sources.
const slidesLoading = computed(() => {
  return carouselLoading.value || promotionsLoading.value || highlightsLoading.value
})

// New slides lead, promoted events first among them, curated ones fill up.
// Composed here because this page is the one place allowed to know the
// events, the content domains and the home layer; none of them knows another.
const carouselSlides = computed(() => {
  const now = new Date(highlights.value.now)
  return composeSlides({
    events: promoted.value.map((card) => eventSlide(card, now)),
    fresh: highlights.value.slides,
    recent: highlights.value.recent,
    curated: slides.value ?? []
  })
})
const { sponsors, loading: sponsorsLoading } = useSponsoring()
const { data: collective, loading: collectiveLoading } = useOpenCollective()
const { items: faqItems, loading: faqLoading } = useFaqContent()
useHomeSeo({ title: t('index.title'), image: sectionOgImage('home', locale.value) })


// Discord ("Mitreden") and the server addresses ("Spielen") lead; reasoning in the change design.
// Sections below the carousel are lazy + hydrate-on-visible; see tests/architecture/lazy-components.spec.ts.
</script>

<template>
  <div class="pt-6 md:mx-auto md:max-w-6xl md:px-4 md:pt-10 lg:px-8">
    <h1 class="text-headline-medium font-bold text-on-surface md:text-display-small">{{ t('index.title') }}</h1>
  </div>
  <div class="-mx-4 sm:-mx-6 px-0 py-6 md:py-10 md:mx-auto md:max-w-6xl md:px-4 lg:px-8">
    <CarouselSkeleton v-if="slidesLoading" />
    <Carousel
      v-else
      :slides="carouselSlides"
      aspect="16/9"
      :aria-label="t('index.carousel_aria')"
    />
  </div>
  <LazyDiscordCta hydrate-on-visible :href="discordUrl" :members="numbers.discordMembers" />
  <ServerAddressesSkeleton v-if="connectLoading" />
  <LazyServerAddresses
    v-else-if="connect"
    hydrate-on-visible
    :java-address="connect.javaAddress"
    :bedrock-host="connect.bedrockHost"
    :bedrock-port="connect.bedrockPort"
  />
  <LazyCommunityStrip hydrate-on-visible :numbers="numbers" :to="`/${locale}/community`" />
  <ServerConceptSkeleton v-if="conceptLoading" />
  <LazyServerConcept
    v-else-if="concept"
    hydrate-on-visible
    :title="concept.title"
    :subtitle="concept.subtitle"
    :points="concept.points || []"
  />
  <SponsoringSkeleton v-if="sponsorsLoading" />
  <LazySponsoring v-else-if="sponsors?.length" hydrate-on-visible :sponsors="sponsors" />
  <OpenCollectiveSkeleton v-if="collectiveLoading" />
  <LazyOpenCollectiveStats
    v-else-if="collective.available"
    hydrate-on-visible
    :total-raised="collective.totalRaised"
    :goal="collective.goal"
    :contributors="collective.contributors"
    :currency="collective.currency"
    :link="collective.link"
    :updated-at="collective.updatedAt"
  />
  <FaqSectionSkeleton v-if="faqLoading" />
  <LazyFaqSection v-else hydrate-on-visible :items="faqItems" />
</template>
