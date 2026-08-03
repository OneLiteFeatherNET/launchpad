<script setup lang="ts">
import Carousel from "~/components/features/home/carousel/Carousel.vue";
import {definePageMeta} from "#imports";

definePageMeta({
  title: 'index.title',
  layout: 'default',
});

const { t } = useI18n()
const { concept, connect, slides } = useHomeContent()
const { sponsors } = useSponsoring()
const { data: collective } = useOpenCollective()
useHomeSeo({ title: t('index.title') })


</script>

<template>
  <!--
    Visually hidden: the carousel is the page's visual opening and the design
    leaves no room for a heading above it. Screen readers still get one, which
    is what names the page in a heading list. Same string as the document
    title, so the two agree.
  -->
  <h1 class="sr-only">{{ t('index.title') }}</h1>
  <!-- Full-bleed Carousel on mobile: remove outer padding and width limits; restore container on md+ -->
  <div class="-mx-4 sm:-mx-6 px-0 py-6 md:py-10 md:mx-auto md:max-w-6xl md:px-4 lg:px-8">
    <Carousel :slides="slides" aspect="16/9" :aria-label="t('index.carousel_aria')" />
  </div>
  <!-- Everything below the carousel is off-screen at load; hydrate-on-visible
       is what turns the code split into a saving. See tests/architecture/lazy-components.spec.ts -->
  <!-- Server Concept Section -->
  <LazyFeaturesHomeServerConcept
    v-if="concept"
    hydrate-on-visible
    :title="concept.title"
    :subtitle="concept.subtitle"
    :points="concept.points || []"
  />
  <!-- Server Connect Section -->
  <LazyFeaturesHomeServerAddresses
    v-if="connect"
    hydrate-on-visible
    :java-address="connect.javaAddress"
    :bedrock-host="connect.bedrockHost"
    :bedrock-port="connect.bedrockPort"
  />
  <LazyFeaturesSponsoring v-if="sponsors?.length" hydrate-on-visible :sponsors="sponsors" />
  <LazyFeaturesOpencollectiveOpenCollectiveStats
    v-if="collective"
    hydrate-on-visible
    :total-raised="collective.totalRaised"
    :goal="collective.goal"
    :contributors="collective.contributors"
    :currency="collective.currency"
    :link="collective.link"
    :updated-at="collective.updatedAt"
  />
  <LazyFeaturesHomeFaqSection hydrate-on-visible />
</template>
