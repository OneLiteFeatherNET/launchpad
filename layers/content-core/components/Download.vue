<script setup lang="ts">
import { computed } from 'vue'

/**
 * A downloadable file or link inside a blog post, written as a markdown block:
 *
 *     ::download{name="Map" url="/files/map.zip" format="zip" size-label="2 MB"}
 *     ::
 *
 * A thin wrapper over the shared `ResourceList`, so the markup stays a real
 * `<a>` in the server HTML and works without JavaScript.
 */
const props = defineProps<{
  name: string
  url: string
  kind?: 'download' | 'link' | 'discord' | 'schematic'
  description?: string
  format?: string
  version?: string
  sizeLabel?: string
}>()

const { t } = useI18n()

const resources = computed(() => [{
  kind: props.kind ?? 'download',
  name: props.name,
  url: props.url,
  description: props.description,
  format: props.format,
  version: props.version,
  sizeLabel: props.sizeLabel,
}])
</script>

<template>
  <div class="not-prose my-6">
    <ResourceList :resources="resources" :label="t('resources.aria')" />
  </div>
</template>
