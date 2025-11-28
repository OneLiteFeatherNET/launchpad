<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import NavigationIconButton from '~/components/ui/buttons/NavigationIconButton.vue'
import CarouselItemImage from '~/components/sections/carousel/items/CarouselItemImage.vue'
import CarouselItemBlog from '~/components/sections/carousel/items/CarouselItemBlog.vue'
import CarouselItemNews from '~/components/sections/carousel/items/CarouselItemNews.vue'
import CarouselItemEvent from '~/components/sections/carousel/items/CarouselItemEvent.vue'
import type { AnySlide, NormalizedSlide } from '~/types/carousel'
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
  ariaLabel?: string
}>(), {
  autoPlay: true,
  interval: 5000,
  loop: true,
  aspect: '16/9',
  ariaLabel: 'Image Carousel'
})

const current = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const isHovering = ref(false)
const prefersReducedMotion = ref(false)

// Aura color handling (outside glow)
const auraColors = ref<Record<number, string>>({})
const defaultAura = 'rgb(39, 169, 225)' // fallback: brand secondary-ish
const activeAuraColor = computed(() => auraColors.value[current.value] || defaultAura)
const outerAuraStyle = computed(() => {
  const base = activeAuraColor.value
  // Outside glow: larger radius, blurred, extends outside container
  return {
    background: `radial-gradient(60% 45% at 50% 50%, ${withAlpha(base, 0.32)} 0%, ${withAlpha(base, 0.16)} 40%, transparent 75%)`,
    filter: 'blur(18px)',
    opacity: '1'
  }
})

// Normalization: Legacy → typed slides
const normalizedSlides = computed<NormalizedSlide[]>(() => normalizeSlides(props.slides))

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

const next = () => {
  goTo(current.value + 1)
}
const prev = () => {
  goTo(current.value - 1)
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
    () => [props.autoPlay, props.interval, slidesCount.value, prefersReducedMotion.value],
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
  const slide = normalizedSlides.value[current.value]
  if (!slide) return ''
  return getSlideAriaText(slide, current.value, slidesCount.value)
})

// Component mapping for dynamic rendering
const componentFor = (slide: NormalizedSlide) => {
  switch (slide.type) {
    case 'image': return CarouselItemImage
    case 'blog': return CarouselItemBlog
    case 'news': return CarouselItemNews
    case 'event': return CarouselItemEvent
    default: return CarouselItemImage
  }
}


// Setup reduced motion preference (client only)
if (import.meta.client) {
  try {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => { prefersReducedMotion.value = !!m.matches }
    set()
    m.addEventListener?.('change', set)
  } catch {}
}

function withAlpha(rgb: string, a: number) {
  const m = rgb.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/)
  if (!m) return rgb
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})`
}
</script>

<template>
  <section
    class="w-full"
    role="region"
    :aria-label="ariaLabel"
    aria-roledescription="carousel"
    @keydown="onKeydown"
    @focusin="isHovering = true"
    @focusout="isHovering = false"
  >
    <!-- Outer wrapper to host aura outside the rounded container -->
    <div class="relative">

      <!-- Ratio wrapper -->
      <div
        class="group relative z-10 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] touch-pan-y select-none min-h-[58svh] md:min-h-0"
        :style="{ paddingTop: aspectPercent }"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
        @pointerdown.passive="onPointerDown"
        @pointerup.passive="onPointerUp"
        @touchstart.passive="onPointerDown"
        @touchend.passive="onPointerUp"
        tabindex="0"
      >
      <!-- Slides track (below dots, below controls) -->
      <div
        class="absolute inset-0 z-30 flex h-full transition-transform duration-500 ease-out"
        :style="trackStyle"
        aria-live="polite"
      >
        <div
          v-for="(s, i) in normalizedSlides"
          :key="i"
          class="relative h-full flex-shrink-0"
          :style="{ width: '100%', minWidth: '100%' }"
          role="group"
          aria-roledescription="slide"
          :aria-label="getSlideAriaText(s, i, slidesCount)"
          :aria-hidden="i !== current"
          :id="`carousel-slide-${i}`"
        >
          <slot name="slide" :item="s" :index="i">
            <component
              :is="componentFor(s)"
              :item="s as any"
              class="absolute inset-0 h-full w-full"
            />
          </slot>
        </div>
      </div>

      <!-- Controls -->
      <div class="absolute inset-x-0 top-0 bottom-10 z-50 flex items-center justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" style="pointer-events: none;">
        <NavigationIconButton
          :aria-label="'Previous slide'"
          :icon="['fas','chevron-left']"
          variant="filled"
          size="xl"
          class="shadow-xl shadow-black/40 ring-1 ring-black/20 cursor-pointer"
          style="pointer-events: auto !important;"
          @click="(e: MouseEvent) => { e.stopPropagation(); prev(); }"
        />
        <NavigationIconButton
          :aria-label="'Next slide'"
          :icon="['fas','chevron-right']"
          variant="filled"
          size="xl"
          class="shadow-xl shadow-black/40 ring-1 ring-black/20 cursor-pointer"
          style="pointer-events: auto !important;"
          @click="(e: MouseEvent) => { e.stopPropagation(); next(); }"
        />
      </div>

      <!-- Dots -->
      <div class="absolute bottom-2 left-1/2 z-40 -translate-x-1/2 transform">
        <div class="flex gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
          <button
            v-for="(_s, i) in normalizedSlides"
            :key="i"
            type="button"
            class="h-2.5 w-2.5 rounded-full transition"
            :class="i === current ? 'bg-white' : 'bg-white/50 hover:bg-white/80'"
            :aria-label="`Show slide ${i + 1}`"
            :aria-current="i === current ? 'true' : undefined"
            :aria-controls="`carousel-slide-${i}`"
            @click.stop="goTo(i)"
          />
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
