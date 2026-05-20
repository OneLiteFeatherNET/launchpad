<script setup lang="ts">
import { computed } from '#imports'
import CommunityPoiCoordsCopy from './CommunityPoiCoordsCopy.vue'
import IconFa from '~/components/base/icons/IconFa.vue'
import type { CommunityPoi } from '~/types/community-poi'

const props = defineProps<{
  poi: CommunityPoi
}>()

const { t, d } = useI18n()

const builders = computed(() => props.poi.builders ?? [])

const coordsLabel = computed(() => {
  const c = props.poi.coordinates
  if (!c) return ''
  const parts = c.y !== undefined ? [c.x,
c.y,
c.z] : [c.x, c.z]
  return parts.join(' / ')
})

const dimensionLabel = computed(() => {
  const dim = props.poi.coordinates?.dimension
  if (!dim) return ''
  return t(`community_poi.dimension.${dim}`)
})

const formatDate = (raw: string | Date | undefined): string => {
  if (!raw) return ''
  const date = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(date.getTime()) ? '' : d(date)
}

const startedDate = computed(() => formatDate(props.poi.startedAt))
const updatedDate = computed(() => formatDate(props.poi.updatedAt))

const builderLinkClass = [
  'underline decoration-dotted underline-offset-2',
  'hover:text-[var(--color-brand-secondary)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary)]'
].join(' ')
</script>

<template>
  <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
    <div v-if="poi.location">
      <dt class="font-medium text-neutral-600 dark:text-neutral-400">
        {{ t('community_poi.meta.location') }}
      </dt>
      <dd class="text-neutral-900 dark:text-neutral-100">{{ poi.location }}</dd>
    </div>
    <div v-if="coordsLabel">
      <dt class="font-medium text-neutral-600 dark:text-neutral-400">
        {{ t('community_poi.meta.coordinates') }}
      </dt>
      <dd class="text-neutral-900 dark:text-neutral-100">
        <span class="font-mono">{{ coordsLabel }}</span>
        <span v-if="dimensionLabel" class="ml-1 text-neutral-500">
          ({{ dimensionLabel }})
        </span>
        <p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('community_poi.meta.coordinates_hint') }}
        </p>
        <CommunityPoiCoordsCopy
          v-if="poi.coordinates"
          class="mt-1"
          :x="poi.coordinates.x"
          :y="poi.coordinates.y"
          :z="poi.coordinates.z"
        />
      </dd>
    </div>
    <div v-if="builders.length">
      <dt class="font-medium text-neutral-600 dark:text-neutral-400">
        {{ t('community_poi.meta.builders') }}
      </dt>
      <dd class="text-neutral-900 dark:text-neutral-100">
        <ul class="flex flex-wrap gap-x-2 gap-y-1">
          <li v-for="(b, i) in builders" :key="b.name + i" class="inline">
            <a
              v-if="b.link"
              :href="b.link"
              target="_blank"
              rel="noopener noreferrer external"
              :class="builderLinkClass"
            >
              {{ b.name }}
              <span v-if="b.mcName" class="ml-1 text-neutral-500">({{ b.mcName }})</span>
            </a>
            <span v-else>
              {{ b.name }}
              <span v-if="b.mcName" class="ml-1 text-neutral-500">({{ b.mcName }})</span>
            </span>
            <span v-if="i < builders.length - 1" aria-hidden="true">,</span>
          </li>
        </ul>
      </dd>
    </div>
    <div v-if="startedDate">
      <dt class="font-medium text-neutral-600 dark:text-neutral-400">
        {{ t('community_poi.meta.started') }}
      </dt>
      <dd class="text-neutral-900 dark:text-neutral-100">
        <time :datetime="new Date(poi.startedAt as string | Date).toISOString()">
          {{ startedDate }}
        </time>
      </dd>
    </div>
    <div v-if="updatedDate">
      <dt class="font-medium text-neutral-600 dark:text-neutral-400">
        {{ t('community_poi.meta.updated') }}
      </dt>
      <dd class="text-neutral-900 dark:text-neutral-100">
        <time :datetime="new Date(poi.updatedAt as string | Date).toISOString()">
          {{ updatedDate }}
        </time>
      </dd>
    </div>
    <div v-if="poi.forumUrl" class="sm:col-span-2">
      <dt class="font-medium text-neutral-600 dark:text-neutral-400">
        {{ t('community_poi.meta.forum') }}
      </dt>
      <dd>
        <a
          :href="poi.forumUrl"
          :class="['inline-flex items-center gap-1.5', builderLinkClass]"
          target="_blank"
          rel="noopener noreferrer external"
        >
          <IconFa :icon="['fas','comment']" class="h-3.5 w-3.5" aria-hidden="true" />
          {{ t('community_poi.meta.forum_open') }}
          <span class="sr-only">{{ t('community_poi.schematics.opens_external') }}</span>
        </a>
      </dd>
    </div>
  </dl>
</template>
