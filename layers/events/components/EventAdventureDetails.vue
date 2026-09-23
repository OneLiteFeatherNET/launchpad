<script setup lang="ts">
import type { EventAdventureInfo } from '../types'

/** Adventure-event block: which map version on which Minecraft version. */
defineProps<{
  adventure?: EventAdventureInfo
}>()

const { t } = useI18n()
</script>

<template>
  <dl
    v-if="adventure && (adventure.mapVersion || adventure.minecraftVersion)"
    class="grid gap-3 sm:grid-cols-2"
  >
    <div v-if="adventure.mapVersion">
      <dt class="text-label-large text-on-surface-variant">
        {{ t('events.adventure.map_version') }}
      </dt>
      <dd class="text-body-large text-on-surface">{{ adventure.mapVersion }}</dd>
    </div>
    <div v-if="adventure.minecraftVersion">
      <dt class="text-label-large text-on-surface-variant">
        {{ t('events.adventure.minecraft_version') }}
      </dt>
      <dd class="text-body-large text-on-surface">{{ adventure.minecraftVersion }}</dd>
    </div>
  </dl>
</template>
