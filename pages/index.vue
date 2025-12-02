<script setup lang="ts">
import {definePageMeta} from "#imports";

definePageMeta({
  title: 'index.title',
  layout: 'default',
});

const { concept, connect, slides } = useHomeContent()
useHomeSeo()

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
</template>

<style scoped>
/* Notes:
   - Place your own images under `public/`, e.g., `public/hero/slide1.jpg`.
   - Then reference it in the array above with `src: '/hero/slide1.jpg'`.
   - `alt` is important for accessibility & SEO. `note` is displayed as overlay text. */
</style>
