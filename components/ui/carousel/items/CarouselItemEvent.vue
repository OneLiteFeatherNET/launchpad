<script setup lang="ts">
import { computed } from 'vue'

interface EventItem {
  type: 'event'
  title: string
  dateStart: string | Date
  dateEnd?: string | Date
  location?: string
  href?: string
  image?: string
  alt?: string
  note?: string
}

const props = defineProps<{ item: EventItem }>()

const start = computed(() => new Date(props.item.dateStart))
const end = computed(() => props.item.dateEnd ? new Date(props.item.dateEnd) : undefined)

const day = computed(() => isNaN(start.value.getTime()) ? '' : start.value.toLocaleDateString('de-DE', { day: '2-digit' }))
const month = computed(() => isNaN(start.value.getTime()) ? '' : start.value.toLocaleDateString('de-DE', { month: 'short' }))
const timeRange = computed(() => {
  if (isNaN(start.value.getTime())) return ''
  const startTime = start.value.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  if (!end.value || isNaN(end.value.getTime())) return startTime
  const endTime = end.value.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  return `${startTime} – ${endTime}`
})
</script>

<template>
  <section class="absolute inset-0 h-full w-full">
    <!-- Optional background image -->
    <NuxtImg
      v-if="item.image"
      :src="item.image"
      :alt="item.alt || item.title"
      format="webp"
      sizes="sm:100vw md:100vw lg:1280px"
      class="absolute inset-0 h-full w-full object-cover"
      preload
    />

    <!-- Gradient overlay for readability -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

    <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
      <div class="max-w-3xl rounded-lg bg-black/45 p-4 text-white backdrop-blur-sm">
        <div class="mb-3 flex items-center gap-3">
          <!-- Date badge -->
          <div class="flex items-center gap-2 rounded-md bg-white/15 px-3 py-2">
            <div class="text-center leading-none">
              <div class="text-lg font-bold">{{ day }}</div>
              <div class="text-xs uppercase tracking-wide">{{ month }}</div>
            </div>
            <div class="ml-1 text-xs opacity-90">
              {{ timeRange }}
            </div>
          </div>
          <!-- Location chip -->
          <div v-if="item.location" class="rounded-full bg-white/15 px-3 py-1 text-xs">
            <font-awesome-icon :icon="['fas','location-dot']" class="mr-1 h-3 w-3" />
            {{ item.location }}
          </div>
        </div>

        <h3 class="mb-2 text-xl font-semibold leading-snug sm:text-2xl">
          <component :is="item.href ? 'NuxtLink' : 'div'" :to="item.href" class="hover:underline" :aria-label="item.href ? `Event: ${item.title}` : undefined">
            {{ item.title }}
          </component>
        </h3>

        <p v-if="item.note" class="mb-3 text-white/90">
          {{ item.note }}
        </p>

        <NuxtLink
          v-if="item.href"
          :to="item.href"
          class="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-black transition hover:bg-white"
          :aria-label="`Zum Event: ${item.title}`"
        >
          Details
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
