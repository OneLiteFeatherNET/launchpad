<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useHead, useImage } from '#imports'
import NavigationIconButton from '~/components/base/buttons/NavigationIconButton.vue'
import CarouselItemImage from '~/components/features/home/carousel/items/CarouselItemImage.vue'
import CarouselItemBlog from '~/components/features/home/carousel/items/CarouselItemBlog.vue'
import CarouselItemNews from '~/components/features/home/carousel/items/CarouselItemNews.vue'
import CarouselItemEvent from '~/components/features/home/carousel/items/CarouselItemEvent.vue'
import CarouselItemPoi from '~/components/features/home/carousel/items/CarouselItemPoi.vue'
import type { AnySlide, NormalizedSlide } from '~/types/carousel'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { normalizeSlides, getSlideAriaText } from '~/composables/useCarousel'

const props = withDefaults(defineProps<{
  /**
   * Accepts both the old format (image only) and various types
   */
  slides: AnySlide[]
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  /** aspect in the form "16/9", "4/3", etc. Used for the container ratio */
  aspect?: string
  /** Overrides the region name. Left out, the locale supplies one. */
  ariaLabel?: string
}>(), {
  autoPlay: true,
  interval: 5000,
  loop: true,
  aspect: '16/9',
  // Deliberately undefined rather than a literal: a prop default is evaluated
  // once, outside any locale, so the name has to come from `t()` below.
  ariaLabel: undefined
})

const { t } = useI18n()

// A prop default cannot be translated — it is evaluated once, outside any
// locale. Falling back here instead means a caller that passes no name still
// gets one in the reader's language.
const resolvedAriaLabel = computed(() => props.ariaLabel || t('carousel.label'))

const current = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const isHovering = ref(false)
// useMediaQuery rather than a hand-rolled matchMedia listener: it unregisters
// with the effect scope. The previous version subscribed to the MediaQueryList
// and never unsubscribed, so every visit to this page left another live
// listener holding the whole component scope.
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

// Normalization: Legacy → typed slides
const normalizedSlides = computed<NormalizedSlide[]>(() => normalizeSlides(props.slides))

const slidesCount = computed(() => normalizedSlides.value.length)
const lastIndex = computed(() => Math.max(0, slidesCount.value - 1))
const img = useImage()

// Preload the very first slide for faster LCP discovery
const preloadLink = computed(() => {
  const slide = normalizedSlides.value[0]
  if (!slide) return null

  const src
    = slide.type === 'image'
      ? slide.src
      : slide.type === 'blog'
        || slide.type === 'news'
        || slide.type === 'event'
        || slide.type === 'poi'
        ? slide.image
        : undefined

  if (!src) return null

  const widths = [640, 1280]
  const srcset = widths
    .map((w) => `${img(src, { width: w, format: 'avif', quality: 75 })} ${w}w`)
    .join(', ')

  return {
    href: img(src, { width: 1280, format: 'avif', quality: 75 }),
    imagesrcset: srcset,
    imagesizes: '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1280px'
  }
})

useHead(() => {
  if (!preloadLink.value) return {}
  return {
    link: [
      {
        rel: 'preload',
        as: 'image',
        fetchpriority: 'high',
        href: preloadLink.value.href,
        imagesrcset: preloadLink.value.imagesrcset,
        imagesizes: preloadLink.value.imagesizes
      }
    ]
  }
})

// Whether the slide showing now is the one the user asked for. The live
// region reads it: the WAI-ARIA APG wants a carousel to announce changes the
// user triggered, and to stay quiet while it rotates on its own — twelve
// unprompted announcements a minute is what `aria-live` exists to avoid.
const userInitiated = ref(false)

// WCAG 2.2.2: autoplay needs a control the user can reach. Hover- and
// focus-pause are not that — neither exists on touch, and both require being
// inside the component already.
const userPaused = ref(false)

const goTo = (index: number, byUser = true) => {
  if (slidesCount.value === 0) return
  userInitiated.value = byUser
  if (props.loop) {
    current.value = (index + slidesCount.value) % slidesCount.value
  } else {
    current.value = Math.min(Math.max(index, 0), lastIndex.value)
  }
}

const next = (byUser = true) => {
  goTo(current.value + 1, byUser)
}
const prev = (byUser = true) => {
  goTo(current.value - 1, byUser)
}

const start = () => {
  // Always clear any previous interval
  stop()
  // Conditions that disable autoplay
  if (!props.autoPlay || slidesCount.value <= 1) return
  // SSR guard: only run intervals in the browser
  if (import.meta.server) return
  // Respect prefers-reduced-motion
  if (prefersReducedMotion.value) return
  // Paused by the user: clear the timer rather than let it fire into a
  // no-op every interval. The watch below re-runs start() when this flips.
  if (userPaused.value) return
  timer.value = setInterval(() => {
    if (!isHovering.value && !userPaused.value) next(false)
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
    () => [props.autoPlay,
props.interval,
slidesCount.value,
prefersReducedMotion.value,
userPaused.value],
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
  // Ignore if clicking on a button or interactive element
  const target = e.target as HTMLElement
  if (target?.closest('button') || target?.closest('[role="button"]')) {
    return
  }
  startX.value = 'touches' in e ? e.touches[0]?.clientX ?? null : (e as PointerEvent).clientX
}
const onPointerUp = (e: PointerEvent | TouchEvent) => {
  if (startX.value == null) return
  const endX = 'changedTouches' in e ? e.changedTouches[0]?.clientX : (e as PointerEvent).clientX
  if (endX === undefined) return
  const delta = endX - startX.value
  const threshold = 40
  if (Math.abs(delta) > threshold) {
    delta < 0 ? next() : prev()
  }
  startX.value = null
}

// Offering a pause button for a carousel that never moves would be a control
// for nothing — and prefers-reduced-motion already stops it entirely.
const canAutoPlay = computed(() => {
  return props.autoPlay && slidesCount.value > 1 && !prefersReducedMotion.value
})

// Bound rather than inlined: the same utility list as the dot buttons, and
// spelled out in the template it would be a 138-character attribute.
const controlButtonClass = [
  'grid h-6 w-6 place-items-center rounded-full text-white/90',
  'transition hover:text-white',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
].join(' ')

const aspectPercent = computed(() => {
  const [w, h] = props.aspect.split('/').map(n => Number(n))
  if (!isFinite(w ?? 0) || !isFinite(h ?? 0) || (h ?? 0) === 0) return '56.25%'
  return `${((h ?? 16) / (w ?? 9)) * 100}%`
})

// Style for the sliding track – force GPU acceleration and hint repaint
const trackStyle = computed(() => ({
  transform: `translate3d(-${current.value * 100}%, 0, 0)`,
  willChange: 'transform'
}))

// Accessibility: Live text for current slide
const liveText = computed(() => {
  if (!userInitiated.value) return ''
  const slide = normalizedSlides.value[current.value]
  if (!slide) return ''
  return getSlideAriaText(slide, current.value, slidesCount.value, t)
})

// Component mapping for dynamic rendering
const componentFor = (slide: NormalizedSlide) => {
  switch (slide.type) {
    case 'image': return CarouselItemImage
    case 'blog': return CarouselItemBlog
    case 'news': return CarouselItemNews
    case 'event': return CarouselItemEvent
    case 'poi': return CarouselItemPoi
    default: return CarouselItemImage
  }
}


</script>

<template>
  <!-- carousel container per WAI-ARIA APG; section with a name is implicitly a region and owns the keyboard interaction -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <section
    class="w-full"
    :aria-label="resolvedAriaLabel"
    aria-roledescription="carousel"
    @keydown="onKeydown"
    @focusin="isHovering = true"
    @focusout="isHovering = false"
  >
    <!-- Outer wrapper to host aura outside the rounded container -->
    <div class="relative">

      <!-- Ratio wrapper -->
      <!-- focusable swipe surface; pointer/touch gestures have keyboard parity via the section keydown handler -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        class="group relative z-10 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] touch-pan-y select-none min-h-[58svh] md:min-h-0"
        :style="{ paddingTop: aspectPercent }"
        tabindex="0"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
        @focusin="isHovering = true"
        @focusout="isHovering = false"
        @pointerdown.passive="onPointerDown"
        @pointerup.passive="onPointerUp"
        @touchstart.passive="onPointerDown"
        @touchend.passive="onPointerUp"
      >
      <!-- Slides track (below dots, below controls) -->
      <div
        class="absolute inset-0 z-30 flex h-full transition-transform duration-500 ease-out"
        :style="trackStyle"
      >
        <div
          v-for="(s, i) in normalizedSlides"
          :id="`carousel-slide-${i}`"
          :key="i"
          class="relative h-full flex-shrink-0"
          :style="{ width: '100%', minWidth: '100%' }"
          role="group"
          aria-roledescription="slide"
          :aria-label="getSlideAriaText(s, i, slidesCount, t)"
          :aria-hidden="i !== current"
          :inert="i !== current ? true : undefined"
        >
          <slot name="slide" :item="s" :index="i">
            <component
              :is="componentFor(s)"
              :item="s as any"
              class="absolute inset-0 h-full w-full"
              :priority="i === 0"
            />
          </slot>
        </div>
      </div>

      <!-- Controls -->
      <div class="absolute inset-x-0 top-0 bottom-10 z-50 flex items-center justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" style="pointer-events: none;">
        <NavigationIconButton
          :aria-label="t('carousel.previous_slide')"
          :icon="['fas','chevron-left']"
          variant="filled"
          size="lg"
          class="shadow-xl shadow-black/40 ring-1 ring-black/20 cursor-pointer"
          style="pointer-events: auto !important;"
          @click="(e: MouseEvent) => { e.stopPropagation(); prev(); }"
        />
        <NavigationIconButton
          :aria-label="t('carousel.next_slide')"
          :icon="['fas','chevron-right']"
          variant="filled"
          size="lg"
          class="shadow-xl shadow-black/40 ring-1 ring-black/20 cursor-pointer"
          style="pointer-events: auto !important;"
          @click="(e: MouseEvent) => { e.stopPropagation(); next(); }"
        />
      </div>

      <!-- Dots -->
      <div class="absolute bottom-2 left-1/2 z-40 -translate-x-1/2 transform">
        <div class="flex items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
          <!--
            Deliberately here and not in the prev/next bar above: that one is
            `opacity-0 group-hover:opacity-100`, so a pause button in it would
            be invisible on touch — the case it exists for.
          -->
          <button
            v-if="canAutoPlay"
            type="button"
            :class="controlButtonClass"
            :aria-label="userPaused ? t('carousel.play') : t('carousel.pause')"
            :aria-pressed="userPaused ? 'true' : 'false'"
            @click.stop="userPaused = !userPaused"
          >
            <FontAwesomeIcon
              :icon="userPaused ? faPlay : faPause"
              class="h-3 w-3"
              aria-hidden="true"
            />
          </button>
          <button
            v-for="(_s, i) in normalizedSlides"
            :key="i"
            type="button"
            class="group grid h-6 w-6 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            :aria-label="t('carousel.show_slide', { index: i + 1 })"
            :aria-current="i === current ? 'true' : undefined"
            :aria-controls="`carousel-slide-${i}`"
            @click.stop="goTo(i)"
          >
            <span
              aria-hidden="true"
              class="h-3.5 w-3.5 rounded-full transition ring-1 ring-white/60"
              :class="i === current ? 'bg-[var(--color-brand-accent,#38bdf8)] ring-2 ring-offset-1 ring-offset-black/20' : 'bg-white/50 group-hover:bg-white/80'"
            />
          </button>
        </div>
      </div>

      <!-- Live region for screen readers -->
      <span class="sr-only" aria-live="polite">{{ liveText }}</span>
      </div>
    </div>
  </section>

</template>

<style scoped>
/* Visually hidden utility if Tailwind's sr-only isn't available for some reason */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* no extra styles */
</style>
