<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Carousel from "~/components/features/home/carousel/Carousel.vue";
import {definePageMeta} from "#imports";

definePageMeta({
  title: 'index.title',
  layout: 'default',
});

const { concept, connect, slides } = useHomeContent()
const { data: collective } = await useOpenCollective()
useHomeSeo()

const LazyServerConcept = defineAsyncComponent(() => import('~/components/features/home/server-concept/ServerConcept.vue'))
const LazyServerAddresses = defineAsyncComponent(() => import('~/components/features/home/server-addresses/ServerAddresses.vue'))
const LazySponsoring = defineAsyncComponent(() => import('~/components/features/home/sponsoring/Sponsoring.vue'))
const LazyOpenCollective = defineAsyncComponent(() => import('~/components/features/home/opencollective/OpenCollectiveStats.vue'))

type SponsorCard = {
  name: string
  url: string
  description?: string
  badge?: string
}

const sponsors: SponsorCard[] = [
  {
    name: 'Cloudflare',
    url: 'https://www.cloudflare.com/',
    description: 'Edge CDN, DDoS-Schutz und DNS-Performance für unser Netzwerk.',
    badge: 'CDN & Security'
  },
  {
    name: '1Password',
    url: 'https://1password.com/',
    description: 'Sichere Team-Vaults, Secrets-Verwaltung und Zugriffskontrolle.',
    badge: 'Security'
  }
]

</script>

<template>
  <!-- Full-bleed Carousel on mobile: remove outer padding and width limits; restore container on md+ -->
  <div class="-mx-4 sm:-mx-6 px-0 py-6 md:py-10 md:mx-auto md:max-w-6xl md:px-4 lg:px-8">
    <Carousel :slides="slides" aspect="16/9" aria-label="Startseiten-Highlight-Karussell" />
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
  <LazySponsoring :sponsors="sponsors" />
  <LazyOpenCollective
    v-if="collective?.value"
    :total-raised="collective.value.totalRaised"
    :goal="collective.value.goal"
    :contributors="collective.value.contributors"
    :currency="collective.value.currency"
    :link="collective.value.link"
    :updated-at="collective.value.updatedAt"
  />
</template>

<style scoped>
/* Notes:
   - Place your own images under `public/`, e.g., `public/hero/slide1.jpg`.
   - Then reference it in the array above with `src: '/hero/slide1.jpg'`.
   - `alt` is important for accessibility & SEO. `note` is displayed as overlay text. */
</style>
