<script setup lang="ts">
import { computed } from '#imports'
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
  'hover:text-[var(--color-brand-secondary,#6366f1)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary,#6366f1)]'
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
      <dd class="font-mono text-neutral-900 dark:text-neutral-100">
        {{ coordsLabel }}
        <span v-if="dimensionLabel" class="ml-1 font-sans text-neutral-500">
          ({{ dimensionLabel }})
        </span>
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
  </dl>
</template>
