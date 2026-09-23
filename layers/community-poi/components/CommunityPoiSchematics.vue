<script setup lang="ts">
import { computed } from '#imports'
import type { CommunityPoiSchematic } from '../types'

/**
 * A POI's schematics, shown through the shared `ResourceList`. What only a
 * community build has — Litematica's placement guide (origin, facing,
 * rotation) and the hint on how to load a schematic — is added here through
 * the list's `details` slot, so `base` stays free of Litematica knowledge.
 */
const props = defineProps<{
  schematics: CommunityPoiSchematic[]
}>()

const { t } = useI18n()

const byUrl = computed(() => {
  const entries = props.schematics.map((schematic) => [schematic.url, schematic] as const)
  return new Map(entries)
})

const resources = computed(() => props.schematics.map((schematic) => ({
  kind: 'schematic' as const,
  name: schematic.name,
  url: schematic.url,
  format: schematic.format,
  version: schematic.version,
  sizeLabel: schematic.sizeLabel,
  meta: schematic.litematicaVersion
    ? [t('community_poi.schematics.litematica_version', { version: schematic.litematicaVersion })]
    : undefined,
})))

const setupOf = (url: string) => {
  const schematic = byUrl.value.get(url)
  if (!schematic) return undefined
  const { origin, facing, rotation, setupNotes } = schematic
  const hasSetup = origin || facing || rotation || setupNotes
  return hasSetup ? schematic : undefined
}
</script>

<template>
  <div v-if="resources.length">
    <ResourceList :resources="resources" :label="t('community_poi.schematics.aria')">
      <template #details="{ resource }">
        <!-- One-element v-for: binds the lookup once instead of per field. -->
        <template v-for="setup in [setupOf(resource.url)]" :key="setup?.url ?? resource.url">
          <div
            v-if="setup"
            class="mt-3 rounded-small bg-surface-container-high p-3 text-body-small
              text-on-surface-variant"
          >
            <p class="text-label-small uppercase text-on-surface-variant">
              {{ t('community_poi.schematics.setup.title') }}
            </p>
            <dl class="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              <div v-if="setup.origin" class="flex gap-1">
                <dt class="font-medium">{{ t('community_poi.schematics.setup.origin') }}:</dt>
                <dd class="font-mono">
                  {{ setup.origin?.x }} / {{ setup.origin?.y }} / {{ setup.origin?.z }}
                </dd>
              </div>
              <div v-if="setup.facing" class="flex gap-1">
                <dt class="font-medium">{{ t('community_poi.schematics.setup.facing') }}:</dt>
                <dd>{{ t(`community_poi.facing.${setup.facing}`) }}</dd>
              </div>
              <div v-if="setup.rotation" class="flex gap-1">
                <dt class="font-medium">{{ t('community_poi.schematics.setup.rotation') }}:</dt>
                <dd class="font-mono">{{ t(`community_poi.rotation.${setup.rotation}`) }}</dd>
              </div>
            </dl>
            <p v-if="setup.setupNotes" class="mt-2 whitespace-pre-line">
              {{ setup.setupNotes }}
            </p>
          </div>
        </template>
      </template>
    </ResourceList>
    <p class="mt-3 text-body-small text-on-surface-variant">
      {{ t('community_poi.schematics.hint') }}
    </p>
  </div>
</template>
