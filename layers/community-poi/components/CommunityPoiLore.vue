<script setup lang="ts">
import {
  POI_CALLOUT,
  POI_CALLOUT_BODY,
  POI_CALLOUT_LABEL,
} from '../utils/poiCalloutClasses'

defineProps<{
  lore: string
}>()

const { t } = useI18n()

</script>

<template>
  <article :class="POI_CALLOUT['brand-purple']" :aria-label="t('community_poi.lore.aria')">
    <h3 :class="POI_CALLOUT_LABEL">
      <IconFa :icon="['fas','book-open']" class="h-3.5 w-3.5" aria-hidden="true" />
      {{ t('community_poi.lore.title') }}
    </h3>
    <p :class="POI_CALLOUT_BODY">{{ lore }}</p>
  </article>
</template>
