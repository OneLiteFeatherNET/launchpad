<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import M3IconButton from './M3IconButton.vue'

/**
 * Image grid with an enlarging dialog. Domain-neutral: callers pass plain
 * images and the accessible name of the gallery, so a community build, an
 * event or anything else can use it without this file knowing which.
 *
 * Keyboard: Enter/Space on a thumbnail opens it, Arrow keys page through,
 * Escape closes and returns focus to the thumbnail that opened the dialog.
 * The controls sit on surface containers rather than directly on the scrim,
 * so their contrast comes from the colour roles in both schemes.
 */
export interface MediaGalleryImage {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

const props = defineProps<{
  images: MediaGalleryImage[]
  /** Accessible name of the gallery and its dialog. */
  label: string
}>()

const { t } = useI18n()

const open = ref(false)
const activeIndex = ref(0)
const dialogRef = ref<HTMLElement | null>(null)
const lastTrigger = ref<HTMLElement | null>(null)

const activeImage = computed(() => props.images[activeIndex.value] ?? null)

const focusClose = () => {
  dialogRef.value?.querySelector<HTMLElement>('[data-gallery-close]')?.focus()
}

const openAt = async (index: number, trigger: HTMLElement | null) => {
  activeIndex.value = index
  lastTrigger.value = trigger
  open.value = true
  await nextTick()
  focusClose()
}

const close = () => {
  open.value = false
  nextTick(() => lastTrigger.value?.focus())
}

const showPrev = () => {
  if (!props.images.length) return
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

const showNext = () => {
  if (!props.images.length) return
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}

const onKey = (event: KeyboardEvent) => {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPrev()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNext()
  }
}

// `open` only ever changes through a click, so this runs in the browser
// alone; no `import.meta.client` guard needed (and none to stub in tests).
watch(open, (value) => {
  if (value) {
    document.addEventListener('keydown', onKey)
    document.body.classList.add('overflow-hidden')
  } else {
    document.removeEventListener('keydown', onKey)
    document.body.classList.remove('overflow-hidden')
  }
})

onBeforeUnmount(() => {
  if (!open.value) return
  document.removeEventListener('keydown', onKey)
  document.body.classList.remove('overflow-hidden')
})

const tileButtonClass
  = 'group block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-medium '
    + 'bg-surface-container shadow-elevation-1 transition-shadow duration-150 ease-standard '
    + 'hover:shadow-elevation-2 focus-ring'
const tileImgClass
  = 'h-full w-full object-cover transition-transform duration-300 ease-standard '
    + 'motion-reduce:transition-none group-hover:scale-[1.03]'
const captionClass
  = 'mx-auto mt-2 w-fit rounded-small bg-surface-container-highest px-3 py-1 '
    + 'text-center text-body-medium text-on-surface'
const pillClass
  = 'rounded-full bg-surface-container-highest px-3 py-1 text-label-large tabular-nums text-on-surface'
</script>

<template>
  <section v-if="images.length" :aria-label="label">
    <!-- The tile clips its own image (rounded, zoom on hover); the list item
         does not clip, so the focus ring around the tile stays whole. -->
    <ul class="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 md:grid-cols-4">
      <li v-for="(img, index) in images" :key="img.src">
        <figure class="flex flex-col gap-2">
          <button
            type="button"
            :class="tileButtonClass"
            :aria-label="t('media_gallery.open_at', { current: index + 1, total: images.length })"
            @click="(event) => openAt(index, event.currentTarget as HTMLElement)"
          >
            <!-- `block h-full`: <picture> is inline, and an inline box
                 ignores the height the image should fill. -->
            <NuxtPicture
              class="block h-full w-full"
              :src="img.src"
              :alt="img.alt"
              :width="img.width ?? 800"
              :height="img.height ?? 600"
              sizes="xs:240px sm:320px md:400px"
              fit="cover"
              quality="75"
              loading="lazy"
              :img-attrs="{ class: tileImgClass }"
              format="avif,webp"
            />
          </button>
          <figcaption v-if="img.caption" class="px-1 text-body-small text-on-surface-variant">
            {{ img.caption }}
          </figcaption>
        </figure>
      </li>
    </ul>

    <Teleport v-if="open" to="body">
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        class="fixed inset-0 z-50 flex flex-col bg-scrim/85 p-4 backdrop-blur-sm"
      >
        <button
          type="button"
          class="absolute inset-0 -z-10 h-full w-full cursor-default"
          :aria-label="t('media_gallery.close')"
          tabindex="-1"
          @click="close"
        />
        <div class="flex items-center justify-between">
          <span :class="pillClass">{{ activeIndex + 1 }} / {{ images.length }}</span>
          <M3IconButton
            data-gallery-close
            variant="tonal"
            :icon="['fas', 'times']"
            :label="t('media_gallery.close')"
            @click="close"
          />
        </div>
        <div class="relative flex flex-1 items-center justify-center">
          <M3IconButton
            v-if="images.length > 1"
            class="absolute left-2"
            variant="tonal"
            :icon="['fas', 'chevron-left']"
            :label="t('media_gallery.prev')"
            @click="showPrev"
          />
          <figure v-if="activeImage" class="max-h-full max-w-full">
            <NuxtPicture
              class="block"
              :src="activeImage.src"
              :alt="activeImage.alt"
              :width="activeImage.width ?? 1600"
              :height="activeImage.height ?? 1200"
              sizes="xs:90vw sm:90vw md:80vw lg:1200px"
              fit="contain"
              quality="80"
              :img-attrs="{ class: 'max-h-[80vh] w-auto rounded-medium object-contain' }"
              format="avif,webp"
            />
            <figcaption
              v-if="activeImage.caption"
              :class="captionClass"
            >
              {{ activeImage.caption }}
            </figcaption>
          </figure>
          <M3IconButton
            v-if="images.length > 1"
            class="absolute right-2"
            variant="tonal"
            :icon="['fas', 'chevron-right']"
            :label="t('media_gallery.next')"
            @click="showNext"
          />
        </div>
      </div>
    </Teleport>
  </section>
</template>
