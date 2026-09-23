<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiSchematic } from '../types'

const props = defineProps<{
  schematics: CommunityPoiSchematic[]
}>()

const { t } = useI18n()

const items = computed(() => props.schematics ?? [])

const isExternal = (url: string) => /^https?:\/\//i.test(url)
const formatLabel = (format?: string) => (format ? `.${format}` : '')

const cardClass = 'rounded-medium border border-outline-variant bg-surface-container-low p-4'

const metaClass
  = 'mt-1 flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant'

const setupClass
  = 'mt-3 rounded-small bg-surface-container-highest p-3 text-body-small text-on-surface-variant'

const setupTitleClass = 'text-label-small uppercase text-on-surface-variant'

const facingLabel = (facing?: CommunityPoiSchematic['facing']) => facing ? t(`community_poi.facing.${facing}`) : ''
const rotationLabel = (rotation?: CommunityPoiSchematic['rotation']) => rotation ? t(`community_poi.rotation.${rotation}`) : ''
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
            <p class="truncate text-title-small text-on-surface">
              {{ schematic.name }}
            </p>
            <p :class="metaClass">
              <span
                v-if="schematic.format"
                class="rounded-extra-small bg-surface-container-highest px-1.5 py-0.5 font-mono"
              >
                {{ formatLabel(schematic.format) }}
              </span>
              <span v-if="schematic.version">MC {{ schematic.version }}</span>
              <span v-if="schematic.litematicaVersion">
                {{ t('community_poi.schematics.litematica_version', {
                  version: schematic.litematicaVersion
                }) }}
              </span>
              <span v-if="schematic.sizeLabel">{{ schematic.sizeLabel }}</span>
            </p>
          </div>
          <M3Button
            variant="tonal"
            class="shrink-0"
            :href="schematic.url"
            :download="!isExternal(schematic.url) ? schematic.name : undefined"
            :target="isExternal(schematic.url) ? '_blank' : undefined"
            :rel="isExternal(schematic.url) ? 'noopener noreferrer external' : undefined"
            :icon="['fas','download']"
          >
            <span>{{ t('community_poi.schematics.download') }}</span>
            <span v-if="isExternal(schematic.url)" class="sr-only">
              {{ t('community_poi.schematics.opens_external') }}
            </span>
          </M3Button>
        </div>

        <div
          v-if="schematic.origin || schematic.facing || schematic.rotation || schematic.setupNotes"
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
            <div v-if="schematic.rotation" class="flex gap-1">
              <dt class="font-medium">{{ t('community_poi.schematics.setup.rotation') }}:</dt>
              <dd class="font-mono">{{ rotationLabel(schematic.rotation) }}</dd>
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
    <p class="mt-3 text-body-small text-on-surface-variant">
      {{ t('community_poi.schematics.hint') }}
    </p>
  </section>
</template>
