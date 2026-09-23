<script setup lang="ts">
import {
  CAROUSEL_CAPTION,
  CAROUSEL_CAPTION_POSITION,
  CAROUSEL_SCRIM,
  CAROUSEL_TEXT,
  CAROUSEL_TITLE,
  CAROUSEL_TITLE_LINK,
} from '../utils/carouselClasses'
import {computed} from 'vue'
import { NuxtLink } from '#components'

// `locale` because these format with explicit option objects that vue-i18n's
// `d()` cannot express without named datetimeFormats entries — so the call
// stays, and only the language stops being fixed.
const { t, locale } = useI18n()

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

const props = withDefaults(defineProps<{ item: EventItem; priority?: boolean }>(), {
  priority: false
})

// Pinned to the server's zone: without it the Worker (UTC) and a visitor's
// browser format the same instant differently, which is both a wrong time
// and a hydration mismatch.
const timeZone = 'Europe/Berlin'

const start = computed(() => new Date(props.item.dateStart))
const end = computed(() => props.item.dateEnd ? new Date(props.item.dateEnd) : undefined)

const day = computed(() => isNaN(start.value.getTime()) ? '' : start.value.toLocaleDateString(locale.value, { day: '2-digit', timeZone }))
const month = computed(() => isNaN(start.value.getTime()) ? '' : start.value.toLocaleDateString(locale.value, { month: 'short', timeZone }))
const timeRange = computed(() => {
  if (isNaN(start.value.getTime())) return ''
  const startTime = start.value.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit', timeZone })
  if (!end.value || isNaN(end.value.getTime())) return startTime
  const endTime = end.value.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit', timeZone })
  return `${startTime} – ${endTime}`
})


const dateBadgeClass
  = 'flex items-center gap-2 rounded-small bg-secondary-container px-3 py-2 '
    + 'text-on-secondary-container'
</script>

<template>
  <section class="absolute inset-0 h-full w-full">
    <NuxtPicture
      :src="item.image"
      :alt="item.alt || item.title"
      sizes="sm:100vw md:100vw lg:1280px"
      densities="1x 2x"
      quality="75"
      placeholder="empty"
      format="avif,webp"
      :loading="props.priority ? 'eager' : 'lazy'"
      :preload="props.priority"
      :img-attrs="{
        class: 'absolute inset-0 h-full w-full object-cover',
        fetchpriority: props.priority ? 'high' : undefined
      }"
    />

    <!-- Gradient overlay for readability -->
    <div :class="CAROUSEL_SCRIM" />

    <!-- Content card: extra bottom padding to avoid overlapping the carousel dots -->
    <div :class="CAROUSEL_CAPTION_POSITION">
      <div :class="CAROUSEL_CAPTION">
        <div class="mb-3 flex flex-wrap items-center gap-3 text-on-surface-variant">
          <!-- Date badge -->
          <div :class="dateBadgeClass">
            <div class="text-center leading-none">
              <div class="text-title-large font-bold">{{ day }}</div>
              <div class="text-label-small uppercase">{{ month }}</div>
            </div>
            <div class="ml-1 text-label-medium">
              {{ timeRange }}
            </div>
          </div>
          <!-- Location chip -->
          <M3Chip
            v-if="item.location"
            kind="label"
            :icon="['fas','location-dot']"
            :label="item.location"
          />
        </div>

        <h3 :class="CAROUSEL_TITLE">
          <component
            :is="item.href ? NuxtLink : 'div'"
            :to="item.href"
            :class="CAROUSEL_TITLE_LINK"
            :aria-label="item.href ? t('carousel.event_link', { title: item.title }) : undefined"
          >
            {{ item.title }}
          </component>
        </h3>

        <p v-if="item.note" :class="CAROUSEL_TEXT">
          {{ item.note }}
        </p>

        <M3Button
          v-if="item.href"
          variant="tonal"
          :to="item.href"
          :aria-label="t('carousel.to_event', { title: item.title })"
        >
          Details
          <font-awesome-icon :icon="['fas','arrow-right']" class="h-3.5 w-3.5" aria-hidden="true" />
        </M3Button>
      </div>
    </div>
  </section>
</template>
