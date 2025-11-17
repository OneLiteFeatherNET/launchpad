<script setup lang="ts">
// Bild-Slide: Vollflächiges Bild mit optionalem Overlay-Text (note)
interface Props {
  item: {
    type: 'image'
    src: string
    alt: string
    note?: string
  }
}
const props = defineProps<Props>()
</script>

<template>
  <div class="absolute inset-0 h-full w-full">
    <NuxtImg
      :src="props.item.src"
      :alt="props.item.alt"
      format="webp"
      sizes="sm:100vw md:100vw lg:1280px"
      class="absolute inset-0 h-full w-full object-cover"
      preload
    />

    <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4">
      <p v-if="props.item.note" class="max-w-3xl text-sm text-white drop-shadow-md">
        {{ props.item.note }}
      </p>
    </div>
  </div>
  
</template>
