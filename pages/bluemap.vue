<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  title: 'bluemap.title'
})

useHead({
  meta: [
    { name: 'description', content: 'Interactive BlueMap Karte des OneLiteFeather Minecraft-Servers.' }
  ]
})
</script>

<template>
  <section class="py-6 sm:py-8">
    <div class="mx-auto max-w-screen-2xl">
      <div class="mb-4">
        <h1 class="text-2xl font-semibold text-[var(--color-text)]">BlueMap</h1>
      </div>
      <div class="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        <iframe
          src="https://bluemap.onelitefeather.dev/"
          title="BlueMap"
          class="w-full h-[75vh] sm:h-[80vh]"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    </div>
  </section>
</template>
