<script setup lang="ts">
import type { IconName } from '../types'
import IconFa from './IconFa.vue'
import M3Button from './M3Button.vue'

/**
 * List of downloads and links that belong to a page: files, external pages,
 * a Discord channel, Minecraft schematics. Domain-neutral — whatever a
 * domain knows beyond the fields below (a schematic's placement guide, say)
 * goes into the `details` slot, which receives the resource.
 *
 * External targets open in a new tab with `rel="noopener noreferrer"` (set
 * by M3Button) and say so to screen readers; internal files get `download`.
 */
export type ResourceKind = 'download' | 'link' | 'discord' | 'schematic'

export interface ResourceItem {
  kind: ResourceKind
  name: string
  url: string
  description?: string
  /** File format without the dot, e.g. `litematic`. */
  format?: string
  /** Minecraft version the resource targets. */
  version?: string
  sizeLabel?: string
  /** Further short facts shown beside format and version. */
  meta?: string[]
}

const props = defineProps<{
  resources: ResourceItem[]
  /** Accessible name of the list. */
  label: string
}>()

defineSlots<{
  details?: (scope: { resource: ResourceItem }) => unknown
}>()

const { t } = useI18n()

const ICONS: Record<ResourceKind, IconName> = {
  download: ['fas', 'download'],
  link: ['fas', 'arrow-up-right-from-square'],
  discord: ['fab', 'discord'],
  schematic: ['fas', 'cube'],
}

const isExternal = (url: string) => /^https?:\/\//i.test(url)
const isFile = (kind: ResourceKind) => kind === 'download' || kind === 'schematic'
const hasFacts = (resource: ResourceItem) => {
  const { format, version, sizeLabel, meta } = resource
  return Boolean(format || version || sizeLabel || meta?.length)
}
const downloadName = (resource: ResourceItem) => (
  isFile(resource.kind) && !isExternal(resource.url) ? resource.name : undefined)
const actionLabel = (kind: ResourceKind) => t(isFile(kind) ? 'resources.download' : 'resources.open')
</script>

<template>
  <section v-if="props.resources.length" :aria-label="label">
    <ul class="grid gap-3 sm:grid-cols-2">
      <li
        v-for="resource in props.resources"
        :key="resource.url"
        class="rounded-medium border border-outline-variant bg-surface-container-low p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 gap-3">
            <IconFa
              :icon="ICONS[resource.kind]"
              class="mt-0.5 size-5 shrink-0 text-on-surface-variant"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <p class="truncate text-title-small text-on-surface">
                {{ resource.name }}
              </p>
              <p v-if="resource.description" class="mt-0.5 text-body-small text-on-surface-variant">
                {{ resource.description }}
              </p>
              <p
                v-if="hasFacts(resource)"
                class="mt-1 flex flex-wrap items-center gap-2 text-label-small
                  text-on-surface-variant"
              >
                <span
                  v-if="resource.format"
                  class="rounded-extra-small bg-surface-container-highest px-1.5 py-0.5 font-mono"
                >.{{ resource.format }}</span>
                <span v-if="resource.version">MC {{ resource.version }}</span>
                <span v-for="fact in resource.meta ?? []" :key="fact">{{ fact }}</span>
                <span v-if="resource.sizeLabel">{{ resource.sizeLabel }}</span>
              </p>
            </div>
          </div>
          <M3Button
            variant="tonal"
            class="shrink-0"
            :href="resource.url"
            :target="isExternal(resource.url) ? '_blank' : undefined"
            :download="downloadName(resource)"
          >
            {{ actionLabel(resource.kind) }}
            <span v-if="isExternal(resource.url)" class="sr-only">
              {{ t('resources.opens_new_tab') }}
            </span>
          </M3Button>
        </div>
        <slot name="details" :resource="resource" />
      </li>
    </ul>
  </section>
</template>
