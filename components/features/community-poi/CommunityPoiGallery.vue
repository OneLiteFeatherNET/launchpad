<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from '#imports'
import type { CommunityPoiImage } from '~/types/community-poi'

const props = defineProps<{
  images: CommunityPoiImage[]
}>()

const { t } = useI18n()

const open = ref(false)
const activeIndex = ref(0)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const lastTrigger = ref<HTMLElement | null>(null)

const activeImage = computed(() => props.images[activeIndex.value] || null)

const openAt = async (index: number, trigger: HTMLElement | null) => {
  activeIndex.value = index
  lastTrigger.value = trigger
  open.value = true
  await nextTick()
  closeButtonRef.value?.focus()
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

if (import.meta.client) {
  watch(open, (value) => {
    if (value) {
      document.addEventListener('keydown', onKey)
      document.body.classList.add('overflow-hidden')
    } else {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('overflow-hidden')
    }
  })
}

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    document.body.classList.remove('overflow-hidden')
  }
})

const tileButtonClass = [
  'group block aspect-[4/3] w-full overflow-hidden',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)]'
].join(' ')

const tileImgClass = [
  'h-full w-full object-cover transition-transform duration-300', 'motion-reduce:transition-none group-hover:scale-[1.03]'
].join(' ')

const navButtonClass = [
  'rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20', 'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
].join(' ')

const closeButtonClass = [
  'rounded-md px-2 py-1 text-sm hover:bg-white/10', 'focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
].join(' ')
</script>

<template>
  <section v-if="images.length" :aria-label="t('community_poi.gallery.aria')">
    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <li
        v-for="(img, index) in images"
        :key="img.src"
        class="overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
      >
        <button
          type="button"
          :class="tileButtonClass"
          :aria-label="t('community_poi.gallery.open_at', {
            current: index + 1,
            total: images.length
          })"
          @click="(event) => openAt(index, event.currentTarget as HTMLElement)"
        >
          <NuxtPicture
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
        <p v-if="img.caption" class="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400">
          {{ img.caption }}
        </p>
      </li>
    </ul>

    <Teleport v-if="open" to="body">
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="t('community_poi.gallery.aria')"
        class="fixed inset-0 z-50 flex flex-col bg-black/85 p-4 backdrop-blur-sm"
      >
        <button
          type="button"
          class="absolute inset-0 -z-10 h-full w-full cursor-default"
          :aria-label="t('community_poi.gallery.close')"
          tabindex="-1"
          @click="close"
        />
        <div class="flex items-center justify-between text-white">
          <span class="text-sm tabular-nums">{{ activeIndex + 1 }} / {{ images.length }}</span>
          <button
            ref="closeButtonRef"
            type="button"
            :class="closeButtonClass"
            :aria-label="t('community_poi.gallery.close')"
            @click="close"
          >
            ✕
          </button>
        </div>
        <div class="relative flex flex-1 items-center justify-center">
          <button
            v-if="images.length > 1"
            type="button"
            class="absolute left-2"
            :class="navButtonClass"
            :aria-label="t('community_poi.gallery.prev')"
            @click="showPrev"
          >
            ‹
          </button>
          <figure v-if="activeImage" class="max-h-full max-w-full">
            <NuxtPicture
              :src="activeImage.src"
              :alt="activeImage.alt"
              :width="activeImage.width ?? 1600"
              :height="activeImage.height ?? 1200"
              sizes="xs:90vw sm:90vw md:80vw lg:1200px"
              fit="contain"
              quality="80"
              :img-attrs="{ class: 'max-h-[80vh] w-auto rounded-md object-contain' }"
              format="avif,webp"
            />
            <figcaption
              v-if="activeImage.caption"
              class="mt-2 text-center text-sm text-white/80"
            >
              {{ activeImage.caption }}
            </figcaption>
          </figure>
          <button
            v-if="images.length > 1"
            type="button"
            class="absolute right-2"
            :class="navButtonClass"
            :aria-label="t('community_poi.gallery.next')"
            @click="showNext"
          >
            ›
          </button>
        </div>
      </div>
    </Teleport>
  </section>
</template>
