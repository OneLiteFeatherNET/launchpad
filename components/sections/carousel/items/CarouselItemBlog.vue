<script setup lang="ts">
import {computed} from 'vue'

interface BlogItem {
  type: 'blog'
  title: string
  href: string
  excerpt?: string
  image?: string
  alt?: string
  author?: string
  date?: string | Date
  tag?: string
}

const props = withDefaults(defineProps<{ item: BlogItem; priority?: boolean }>(), {
  priority: false
})

const dateLabel = computed(() => {
  const d = props.item.date ? new Date(props.item.date) : null
  if (!d || Number.isNaN(d.getTime())) return undefined
  try {
    return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return d.toISOString().slice(0, 10)
  }
})
</script>

<template>
  <article class="absolute inset-0 h-full w-full">
    <NuxtPicture
      :src="item.image"
      :alt="item.alt || item.title"
      sizes="sm:100vw md:100vw lg:1280px"
      densities="1x 2x"
      quality="75"
      :placeholder="false"
      format="avif,webp"
      :loading="props.priority ? 'eager' : 'lazy'"
      :preload="props.priority"
      :img-attrs="{
        class: 'absolute inset-0 h-full w-full object-cover',
        fetchpriority: props.priority ? 'high' : undefined
      }"
    />

    <!-- Gradient overlay for readability -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

    <!-- Content card: add extra bottom padding so it doesn't overlap with the carousel dots/indicators -->
    <div class="absolute inset-x-0 bottom-0 p-5 pb-14 sm:p-6 sm:pb-16">
      <div class="max-w-3xl rounded-lg bg-black/45 p-4 text-white backdrop-blur-sm">
        <div class="mb-2 flex items-center gap-3 text-xs uppercase tracking-wide text-white/80">
          <span v-if="item.tag" class="rounded-full bg-white/15 px-3 py-1">{{ item.tag }}</span>
          <span v-if="dateLabel">{{ dateLabel }}</span>
          <span v-if="item.author" class="truncate">von {{ item.author }}</span>
        </div>

        <h3 class="mb-2 text-xl font-semibold leading-snug sm:text-2xl">
          <NuxtLink :to="item.href" class="hover:underline" :aria-label="`Blog: ${item.title}`">
            {{ item.title }}
          </NuxtLink>
        </h3>

        <p v-if="item.excerpt" class="mb-3 line-clamp-3 text-white/90">
          {{ item.excerpt }}
        </p>

        <NuxtLink
          :to="item.href"
          class="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-black transition hover:bg-white"
          :aria-label="`Zum Artikel: ${item.title}`"
        >
          Lesen
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
