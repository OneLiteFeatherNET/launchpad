<script setup lang="ts">
import CommunityPoiCoordsCopy from './CommunityPoiCoordsCopy.vue'
import type { CommunityPoiCoordinates } from '../types'

defineProps<{
  title: string
  coordinates: CommunityPoiCoordinates
}>()
</script>

<template>
  <BluemapFacade :title="title" :coordinates="coordinates">
    <CommunityPoiCoordsCopy
      class="mb-3"
      :x="coordinates.x"
      :y="coordinates.y"
      :z="coordinates.z"
    />
  </BluemapFacade>
</template>
