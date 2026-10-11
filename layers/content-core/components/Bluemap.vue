<script setup lang="ts">
import { computed } from 'vue'
import type { BluemapCoordinates, BluemapDimension } from '#layers/base/types'

/**
 * BlueMap embed for a blog post, loaded on click:
 *
 *     ::bluemap{x=1161 y=75 z=339 world="overworld" title="…"}
 *
 * Markdown hands attributes over as strings or numbers, so they are parsed here.
 */
const props = withDefaults(defineProps<{
  title: string
  x: number | string
  y?: number | string
  z: number | string
  world?: string
}>(), { y: undefined, world: 'overworld' })

const coordinates = computed<BluemapCoordinates | null>(() => {
  const x = Number(props.x)
  const y = props.y === undefined ? undefined : Number(props.y)
  const z = Number(props.z)
  if (!Number.isFinite(x) || !Number.isFinite(z) || (y !== undefined && !Number.isFinite(y))) {
    return null
  }
  const dimension: BluemapDimension = props.world === 'nether' || props.world === 'end'
    ? props.world
    : 'overworld'
  return { x, y, z, dimension }
})
</script>

<template>
  <BluemapFacade
    v-if="coordinates"
    class="not-prose my-6"
    :title="title"
    :coordinates="coordinates"
  />
</template>
