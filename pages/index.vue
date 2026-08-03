<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
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

const LazyServerConcept = defineAsyncComponent(() => import('~/components/features/home/server-concept/ServerConcept.vue'))
const LazyServerAddresses = defineAsyncComponent(() => import('~/components/features/home/server-addresses/ServerAddresses.vue'))
const LazySponsoring = defineAsyncComponent(() => import('~/components/features/sponsoring/Sponsoring.vue'))
const LazyOpenCollective = defineAsyncComponent(() => import('~/components/features/opencollective/OpenCollectiveStats.vue'))
const LazyFaqSection = defineAsyncComponent(() => import('~/components/features/home/faq/FaqSection.vue'))

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
  <!-- Server Concept Section -->
  <LazyServerConcept
    v-if="concept"
    :title="concept.title"
    :subtitle="concept.subtitle"
    :points="concept.points || []"
  />
  <!-- Server Connect Section -->
  <LazyServerAddresses
    v-if="connect"
    :java-address="connect.javaAddress"
    :bedrock-host="connect.bedrockHost"
    :bedrock-port="connect.bedrockPort"
  />
  <LazySponsoring v-if="sponsors?.length" :sponsors="sponsors" />
  <LazyOpenCollective
    v-if="collective"
    :total-raised="collective.totalRaised"
    :goal="collective.goal"
    :contributors="collective.contributors"
    :currency="collective.currency"
    :link="collective.link"
    :updated-at="collective.updatedAt"
  />
  <LazyFaqSection />
</template>
