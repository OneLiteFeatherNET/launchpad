<script setup lang="ts">
// Image slide: full-bleed image with optional overlay text (note)

interface Props {
  item: {
    type: 'image'
    src: string
    alt: string
    note?: string
  }
  /** Mark the slide as priority (used for the first/LCP image) */
  priority?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  priority: false
})

</script>

<template>
  <div class="absolute inset-0 h-full w-full">
    <!-- Raster images via NuxtPicture without blur placeholder and with 2x density -->
    <NuxtPicture
      :src="props.item.src"
      :alt="props.item.alt"
      sizes="sm:100vw md:100vw lg:1280px"
      densities="1x 2x"
      quality="75"
      :placeholder="false"
      format="avif,webp"
      :loading="props.priority ? 'eager' : 'lazy'"
      :preload="props.priority"
      :img-attrs="{
        class: 'absolute inset-0 h-full w-full object-cover object-center',
        fetchpriority: props.priority ? 'high' : undefined
      }"
    />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent md:from-black/80 md:via-black/40 p-3 md:p-4 pb-8 md:pb-12">
      <p v-if="props.item.note" class="max-w-3xl text-sm md:text-base text-white drop-shadow-md">
        <span class="inline-block rounded-md bg-black/50 md:bg-black/60 px-2.5 py-1 md:px-3 md:py-1.5 backdrop-blur-[2px]">{{ props.item.note }}</span>
      </p>
    </div>
  </div>
  
</template>
