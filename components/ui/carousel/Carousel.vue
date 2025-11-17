<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import NavigationIconButton from '~/components/ui/buttons/NavigationIconButton.vue'
import CarouselItemImage from '~/components/ui/carousel/items/CarouselItemImage.vue'
import CarouselItemBlog from '~/components/ui/carousel/items/CarouselItemBlog.vue'
import CarouselItemNews from '~/components/ui/carousel/items/CarouselItemNews.vue'
import CarouselItemEvent from '~/components/ui/carousel/items/CarouselItemEvent.vue'

/**
 * Unterstützte Slide‑Typen
 */
export type ImageSlide = {
  type: 'image'
  src: string
  alt: string
  note?: string
}

export type BlogSlide = {
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

export type NewsSlide = {
  type: 'news'
  title: string
  href?: string
  summary?: string
  image?: string
  alt?: string
  date?: string | Date
  tag?: string
}

export type EventSlide = {
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

/** Altes, bildbasiertes Slide (Backwards‑Kompatibilität) */
export type LegacyImageSlide = {
  src: string
  alt: string
  note?: string
}

export type AnySlide = ImageSlide | BlogSlide | NewsSlide | EventSlide | LegacyImageSlide

const props = withDefaults(defineProps<{
  /**
   * Akzeptiert sowohl das alte Format (nur Bild) als auch verschiedene Typen
   */
  slides: AnySlide[]
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  /** aspect in the form "16/9", "4/3", etc. Used for the container ratio */
  aspect?: string
  ariaLabel?: string
}>(), {
  autoPlay: true,
  interval: 5000,
  loop: true,
  aspect: '16/9',
  ariaLabel: 'Bildkarussell'
})

const current = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const isHovering = ref(false)

// Normalisierung: Legacy → ImageSlide
const normalizedSlides = computed<(ImageSlide | BlogSlide | NewsSlide | EventSlide)[]>(() =>
  (props.slides || []).map((s) => {
    const any = s as AnySlide
    if ((any as ImageSlide).type === 'image' || (any as BlogSlide).type === 'blog' || (any as NewsSlide).type === 'news' || (any as EventSlide).type === 'event') {
      return any as ImageSlide | BlogSlide | NewsSlide | EventSlide
    }
    // Legacy: hat src/alt, aber keinen type
    if ((any as LegacyImageSlide).src && (any as LegacyImageSlide).alt) {
      const legacy = any as LegacyImageSlide
      const converted: ImageSlide = { type: 'image', src: legacy.src, alt: legacy.alt, note: legacy.note }
      return converted
    }
    // Fallback: sichere leere Bild‑Slide
    return { type: 'image', src: '', alt: '' } as ImageSlide
  })
)

const slidesCount = computed(() => normalizedSlides.value.length)
const lastIndex = computed(() => Math.max(0, slidesCount.value - 1))

const goTo = (index: number) => {
  if (slidesCount.value === 0) return
  if (props.loop) {
    current.value = (index + slidesCount.value) % slidesCount.value
  } else {
    current.value = Math.min(Math.max(index, 0), lastIndex.value)
  }
}

const next = () => goTo(current.value + 1)
const prev = () => goTo(current.value - 1)

const start = () => {
  // Always clear any previous interval
  stop()
  // Conditions that disable autoplay
  if (!props.autoPlay || slidesCount.value <= 1) return
  // SSR guard: only run intervals in the browser
  if (import.meta.server) return
  timer.value = setInterval(() => {
    if (!isHovering.value) next()
  }, props.interval)
}

const stop = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// Only watch and start autoplay on the client to avoid SSR interval usage
if (import.meta.client) {
  watch(
    () => [props.autoPlay, props.interval, slidesCount.value],
    () => start(),
    { immediate: true }
  )
}

onMounted(() => start())
onUnmounted(() => stop())

// Keyboard navigation
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    next()
  }
}

// Simple swipe support
const startX = ref<number | null>(null)
const onPointerDown = (e: PointerEvent | TouchEvent) => {
  startX.value = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX
}
const onPointerUp = (e: PointerEvent | TouchEvent) => {
  if (startX.value == null) return
  const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as PointerEvent).clientX
  const delta = endX - startX.value
  const threshold = 40
  if (Math.abs(delta) > threshold) {
    delta < 0 ? next() : prev()
  }
  startX.value = null
}

const aspectPercent = computed(() => {
  const [w, h] = props.aspect.split('/').map(n => Number(n))
  if (!isFinite(w) || !isFinite(h) || h === 0) return '56.25%'
  return `${(h / w) * 100}%`
})

// Style for the sliding track – force GPU acceleration and hint repaint
const trackStyle = computed(() => ({
  transform: `translate3d(-${current.value * 100}%, 0, 0)`,
  willChange: 'transform'
}))

function slideAriaText() {
  const s = normalizedSlides.value[current.value]
  if (!s) return ''
  let label = ''
  switch (s.type) {
    case 'image': label = s.alt || 'Bild'; break
    case 'blog': label = s.title; break
    case 'news': label = s.title; break
    case 'event': label = s.title; break
  }
  return `Folie ${current.value + 1} von ${slidesCount.value}: ${label}`
}
const liveText = computed(slideAriaText)

const componentFor = (s: ImageSlide | BlogSlide | NewsSlide | EventSlide) => {
  switch (s.type) {
    case 'image': return CarouselItemImage
    case 'blog': return CarouselItemBlog
    case 'news': return CarouselItemNews
    case 'event': return CarouselItemEvent
    default: return CarouselItemImage
  }
}
</script>

<template>
  <section
    class="w-full"
    role="region"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <!-- Ratio wrapper -->
    <div
      class="group relative w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] touch-pan-y select-none"
      :style="{ paddingTop: aspectPercent }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      @pointerdown.passive="onPointerDown"
      @pointerup.passive="onPointerUp"
      @touchstart.passive="onPointerDown"
      @touchend.passive="onPointerUp"
      tabindex="0"
    >
      <!-- Slides track (unter Dots, unter Controls) -->
      <div
        class="absolute inset-0 z-30 flex flex-nowrap h-full w-full transition-transform duration-500 ease-out"
        :style="trackStyle"
        aria-live="polite"
      >
        <div
          v-for="(s, i) in normalizedSlides"
          :key="i"
          class="relative h-full w-full shrink-0 grow-0 basis-full"
        >
          <slot name="slide" :item="s" :index="i">
            <component :is="componentFor(s)" :item="s" class="absolute inset-0 h-full w-full" />
          </slot>
        </div>
      </div>

      <!-- Controls -->
      <div class="pointer-events-none absolute inset-0 z-50 flex items-center justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100">
        <div class="pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto focus-within:pointer-events-auto" @pointerdown.stop @pointerup.stop @click.stop>
          <NavigationIconButton
            :aria-label="'Vorherige Folie'"
            :icon="['fas','chevron-left']"
            variant="filled"
            size="xl"
            class="shadow-xl shadow-black/40 ring-1 ring-black/20"
            @click="prev"
          />
        </div>
        <div class="pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto focus-within:pointer-events-auto" @pointerdown.stop @pointerup.stop @click.stop>
          <NavigationIconButton
            :aria-label="'Nächste Folie'"
            :icon="['fas','chevron-right']"
            variant="filled"
            size="xl"
            class="shadow-xl shadow-black/40 ring-1 ring-black/20"
            @click="next"
          />
        </div>
      </div>

      <!-- Dots -->
      <div class="absolute bottom-2 left-1/2 z-40 -translate-x-1/2 transform" @pointerdown.stop @pointerup.stop>
        <div class="flex gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
          <button
            v-for="(s, i) in normalizedSlides"
            :key="i"
            type="button"
            class="h-2.5 w-2.5 rounded-full transition"
            :class="i === current ? 'bg-white' : 'bg-white/50 hover:bg-white/80'"
            :aria-label="`Folie ${i + 1} anzeigen`"
            @click="goTo(i)"
          />
        </div>
      </div>

      <!-- Live region for screen readers -->
      <span class="sr-only" aria-live="polite">{{ liveText }}</span>
    </div>
  </section>
  
</template>

<style scoped>
/* Visually hidden utility if Tailwind's sr-only isn't available for some reason */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
</style>
