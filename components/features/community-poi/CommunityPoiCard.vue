<script setup lang="ts">
import { computed } from '#imports'
import CommunityPoiStatusBadge from './CommunityPoiStatusBadge.vue'
import CommunityPoiCategoryBadge from './CommunityPoiCategoryBadge.vue'
import CommunityPoiProgressBar from './CommunityPoiProgressBar.vue'
import IconFa from '~/components/base/icons/IconFa.vue'
import type { CommunityPoi } from '~/types/community-poi'

const props = defineProps<{
  poi: CommunityPoi
}>()

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

const articleClass = [
  'group flex h-full flex-col overflow-hidden rounded-xl shadow-sm',
  'bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]',
  'transition hover:shadow-md',
  'focus-within:ring-2 focus-within:ring-[var(--color-brand-secondary)]'
].join(' ')

const thumbLinkClass = [
  'relative block aspect-[16/9] w-full overflow-hidden', 'bg-neutral-100 dark:bg-neutral-800 focus:outline-none'
].join(' ')

const thumbImgClass = [
  'h-full w-full object-cover transition-transform duration-500',
  'group-hover:scale-[1.02]',
  'motion-reduce:transition-none'
].join(' ')

const placeholderClass = [
  'flex h-full w-full items-center justify-center', 'text-neutral-400 dark:text-neutral-600'
].join(' ')

const footerClass = [
  'mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs', 'text-neutral-600 dark:text-neutral-400'
].join(' ')

const showcaseBadgeClass = [
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
  'ring-1 ring-inset',
  'bg-[color-mix(in_oklab,var(--color-brand-orange)_15%,white)]',
  'text-[color-mix(in_oklab,var(--color-brand-orange)_70%,black)]',
  'ring-[color-mix(in_oklab,var(--color-brand-orange)_40%,transparent)]',
  'dark:bg-[color-mix(in_oklab,var(--color-brand-orange)_22%,transparent)]',
  'dark:text-[color-mix(in_oklab,var(--color-brand-orange)_30%,white)]'
].join(' ')
</script>

<template>
  <article :class="articleClass">
    <NuxtLink :to="href" :aria-label="detailAria" :class="thumbLinkClass">
      <NuxtPicture
        v-if="poi.thumbnail"
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
      />
      <div v-else :class="placeholderClass">
        <IconFa :icon="['fas','image']" class="h-10 w-10" aria-hidden="true" />
      </div>
      <div class="absolute left-3 top-3 flex flex-wrap items-center gap-2">
        <CommunityPoiStatusBadge :status="poi.status" />
        <CommunityPoiCategoryBadge v-if="poi.category" :category="poi.category" />
        <span
          v-if="poi.acceptsContributions === false"
          :class="showcaseBadgeClass"
          :title="t('community_poi.card.showcase_only')"
        >
          <IconFa :icon="['fas','lock']" class="h-2.5 w-2.5" aria-hidden="true" />
          {{ t('community_poi.card.showcase_only') }}
        </span>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <header>
        <h3 class="text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-50">
          <NuxtLink
            :to="href"
            class="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {{ poi.title }}
          </NuxtLink>
        </h3>
        <p v-if="poi.location" class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {{ poi.location }}
        </p>
      </header>

      <p class="line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">
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
  </article>
</template>
