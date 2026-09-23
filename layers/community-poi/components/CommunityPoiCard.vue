<script setup lang="ts">
import { computed, ref, watch } from '#imports'
import CommunityPoiStatusBadge from './CommunityPoiStatusBadge.vue'
import CommunityPoiCategoryBadge from './CommunityPoiCategoryBadge.vue'
import CommunityPoiProgressBar from './CommunityPoiProgressBar.vue'
import type { CommunityPoi } from '../types'

const props = defineProps<{
  poi: CommunityPoi
}>()

// A thumbnail can be declared and still not arrive — the Cloudflare provider
// fetches originals from the image origin, which does not hold every path that
// exists in `public/`. Without this the browser draws its broken-image glyph
// with the alt text spilled across the card; the placeholder below reads as a
// missing picture, which is what it is.
const thumbnailFailed = ref(false)

// Cards are reused across list renders, so a stale flag would blank the next
// POI shown in this slot.
watch(() => props.poi.thumbnail, () => {
  thumbnailFailed.value = false
})

const { locale, t } = useI18n()

const href = computed(() => `/${locale.value}/community-poi/${props.poi.slug}`)
const builders = computed(() => props.poi.builders ?? [])

const buildersLabel = computed(() => {
  const names = builders.value.map((b) => b.name).filter(Boolean)
  if (!names.length) return ''
  if (names.length <= 2) return names.join(', ')
  return t('community_poi.card.builders_more', {
    first: names[0],
    count: names.length - 1
  })
})

const galleryCount = computed(() => (props.poi.gallery ?? []).length)
const schematicCount = computed(() => (props.poi.schematics ?? []).length)
const detailAria = computed(() => t('community_poi.card.open_detail', { title: props.poi.title }))

const mediaClass = 'relative aspect-[16/9] w-full overflow-hidden bg-surface-container-highest'

const thumbImgClass = [
  'h-full w-full object-cover transition-transform duration-500',
  'group-hover:scale-[1.02]',
  'motion-reduce:transition-none'
].join(' ')

const placeholderClass = 'flex h-full w-full items-center justify-center text-on-surface-variant'

const footerClass
  = 'mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-label-medium '
    + 'text-on-surface-variant'
</script>

<template>
  <!--
    One link per card: the title's, stretched over the whole card. The
    thumbnail used to be a second link to the same page — a second tab stop
    for nothing.
  -->
  <M3Card as="article" variant="outlined" interactive class="group h-full">
    <template #media>
      <div :class="mediaClass">
        <NuxtPicture
          v-if="poi.thumbnail && !thumbnailFailed"
          :src="poi.thumbnail"
          :alt="poi.thumbnailAlt || poi.title"
          sizes="xs:300px sm:500px md:400px lg:500px"
          width="800"
          height="450"
          fit="cover"
          quality="75"
          loading="lazy"
          :img-attrs="{ class: thumbImgClass }"
          format="avif,webp"
          @error="thumbnailFailed = true"
        />
        <div v-else :class="placeholderClass">
          <IconFa :icon="['fas','image']" class="h-10 w-10" aria-hidden="true" />
        </div>
        <div class="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <CommunityPoiStatusBadge :status="poi.status" />
          <CommunityPoiCategoryBadge v-if="poi.category" :category="poi.category" />
          <M3Chip
            v-if="poi.acceptsContributions === false"
            kind="label"
            color="brand-orange"
            :icon="['fas','lock']"
            :label="t('community_poi.card.showcase_only')"
            :title="t('community_poi.card.showcase_only')"
          />
        </div>
      </div>
    </template>

    <div class="flex flex-1 flex-col gap-3">
      <header>
        <h3 class="text-title-large text-on-surface">
          <M3CardLink :to="href" :aria-label="detailAria">
            {{ poi.title }}
          </M3CardLink>
        </h3>
        <p v-if="poi.location" class="mt-0.5 text-body-small text-on-surface-variant">
          {{ poi.location }}
        </p>
      </header>

      <p class="line-clamp-3 text-body-medium text-on-surface-variant">
        {{ poi.summary }}
      </p>

      <CommunityPoiProgressBar :value="poi.progress ?? 0" size="sm" />

      <footer :class="footerClass">
        <span v-if="buildersLabel" class="truncate">
          {{ t('community_poi.card.by') }} {{ buildersLabel }}
        </span>
        <span class="flex items-center gap-3">
          <span v-if="galleryCount" class="inline-flex items-center gap-1">
            <IconFa :icon="['fas','image']" class="h-3 w-3" aria-hidden="true" />
            <span class="sr-only">{{ t('community_poi.card.gallery_count_sr') }}</span>
            {{ galleryCount }}
          </span>
          <span v-if="schematicCount" class="inline-flex items-center gap-1">
            <IconFa :icon="['fas','cube']" class="h-3 w-3" aria-hidden="true" />
            <span class="sr-only">{{ t('community_poi.card.schematic_count_sr') }}</span>
            {{ schematicCount }}
          </span>
        </span>
      </footer>
    </div>
  </M3Card>
</template>
