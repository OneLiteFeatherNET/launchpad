<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiSchematic } from '~/types/community-poi'

const props = defineProps<{
  schematics: CommunityPoiSchematic[]
}>()

const { t } = useI18n()

const items = computed(() => props.schematics ?? [])

const isExternal = (url: string) => /^https?:\/\//i.test(url)
const formatLabel = (format?: string) => (format ? `.${format}` : '')

const cardClass = [
  'rounded-lg border border-neutral-200 bg-white p-4', 'dark:border-neutral-800 dark:bg-neutral-900'
].join(' ')

const metaClass = [
  'mt-1 flex flex-wrap items-center gap-2 text-xs', 'text-neutral-600 dark:text-neutral-400'
].join(' ')

const downloadClass = [
  'inline-flex shrink-0 items-center gap-1 rounded-md',
  'bg-[var(--color-brand,#0ea5e9)] px-3 py-1.5 text-sm font-medium text-white shadow-sm',
  'hover:opacity-90 focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--color-brand-secondary,#6366f1)] focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900'
].join(' ')

const setupClass = [
  'mt-3 rounded-md bg-neutral-50 p-3 text-xs', 'text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300'
].join(' ')

const setupTitleClass = [
  'font-semibold uppercase tracking-wide text-[10px]', 'text-neutral-500 dark:text-neutral-400'
].join(' ')

const facingLabel = (facing?: CommunityPoiSchematic['facing']) => facing ? t(`community_poi.facing.${facing}`) : ''
</script>

<template>
  <section v-if="items.length" :aria-label="t('community_poi.schematics.aria')">
    <ul class="grid gap-3 sm:grid-cols-2">
      <li
        v-for="schematic in items"
        :key="schematic.url"
        :class="cardClass"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-medium text-neutral-900 dark:text-neutral-100">
              {{ schematic.name }}
            </p>
            <p :class="metaClass">
              <span
                v-if="schematic.format"
                class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono dark:bg-neutral-800"
              >
                {{ formatLabel(schematic.format) }}
              </span>
              <span v-if="schematic.version">MC {{ schematic.version }}</span>
              <span v-if="schematic.sizeLabel">{{ schematic.sizeLabel }}</span>
            </p>
          </div>
          <a
            :href="schematic.url"
            :download="!isExternal(schematic.url) ? schematic.name : undefined"
            :target="isExternal(schematic.url) ? '_blank' : undefined"
            :rel="isExternal(schematic.url) ? 'noopener noreferrer external' : undefined"
            :class="downloadClass"
          >
            <span aria-hidden="true">⬇</span>
            <span>{{ t('community_poi.schematics.download') }}</span>
            <span v-if="isExternal(schematic.url)" class="sr-only">
              {{ t('community_poi.schematics.opens_external') }}
            </span>
          </a>
        </div>

        <div
          v-if="schematic.origin || schematic.facing || schematic.setupNotes"
          :class="setupClass"
        >
          <p :class="setupTitleClass">
            {{ t('community_poi.schematics.setup.title') }}
          </p>
          <dl class="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            <div v-if="schematic.origin" class="flex gap-1">
              <dt class="font-medium">{{ t('community_poi.schematics.setup.origin') }}:</dt>
              <dd class="font-mono">
                {{ schematic.origin.x }} / {{ schematic.origin.y }} / {{ schematic.origin.z }}
              </dd>
            </div>
            <div v-if="schematic.facing" class="flex gap-1">
              <dt class="font-medium">{{ t('community_poi.schematics.setup.facing') }}:</dt>
              <dd>{{ facingLabel(schematic.facing) }}</dd>
            </div>
          </dl>
          <p
            v-if="schematic.setupNotes"
            class="mt-2 whitespace-pre-line leading-relaxed"
          >
            {{ schematic.setupNotes }}
          </p>
        </div>
      </li>
    </ul>
    <p class="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
      {{ t('community_poi.schematics.hint') }}
    </p>
  </section>
</template>
