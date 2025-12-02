<script setup lang="ts">
import {computed, computed as vComputed} from 'vue'
import { NuxtLink } from '#components'

interface NewsItem {
  type: 'news'
  title: string
  href?: string
  summary?: string
  image?: string
  alt?: string
  date?: string | Date
  tag?: string
}

const props = withDefaults(defineProps<{ item: NewsItem; priority?: boolean }>(), {
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

const isSvg = vComputed(() => props.item.image ? /\.svg(\?|$)/i.test(props.item.image) : false)
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
      :fetchpriority="props.priority ? 'high' : undefined"
      :preload="props.priority"
      :img-attrs="{ class: 'absolute inset-0 h-full w-full object-cover' }"
    />

    <!-- Gradient overlay for readability -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

    <!-- Content card: extra bottom padding to avoid overlapping the carousel dots -->
    <div class="absolute inset-x-0 bottom-0 p-5 pb-14 sm:p-6 sm:pb-16">
      <div class="max-w-3xl rounded-lg bg-black/45 p-4 text-white backdrop-blur-sm">
        <div class="mb-2 flex items-center gap-3 text-xs uppercase tracking-wide text-white/80">
          <span v-if="item.tag" class="rounded-full bg-white/15 px-3 py-1">{{ item.tag }}</span>
          <span v-if="dateLabel">{{ dateLabel }}</span>
        </div>

        <h3 class="mb-2 text-xl font-semibold leading-snug sm:text-2xl">
          <component
            :is="item.href ? NuxtLink : 'div'"
            :to="item.href"
            class="hover:underline"
            :aria-label="item.href ? `News: ${item.title}` : undefined"
          >
            {{ item.title }}
          </component>
        </h3>

        <p v-if="item.summary" class="text-white/90 line-clamp-3">
          {{ item.summary }}
        </p>

        <NuxtLink
          v-if="item.href"
          :to="item.href"
          class="mt-3 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-black transition hover:bg-white"
          :aria-label="`Zur Meldung: ${item.title}`"
        >
          Mehr
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
