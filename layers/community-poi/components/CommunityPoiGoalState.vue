<script setup lang="ts">
import {
  POI_CALLOUT,
  POI_CALLOUT_BODY,
  POI_CALLOUT_LABEL,
} from '../utils/poiCalloutClasses'
defineProps<{
  goal?: string
  currentState?: string
}>()

const { t } = useI18n()

</script>

<template>
  <section
    v-if="goal || currentState"
    :aria-label="t('community_poi.goal_state.aria')"
    class="grid gap-4 md:grid-cols-2"
  >
    <article v-if="goal" :class="POI_CALLOUT.primary">
      <h3 :class="POI_CALLOUT_LABEL">
        {{ t('community_poi.goal_state.goal') }}
      </h3>
      <p :class="POI_CALLOUT_BODY">{{ goal }}</p>
    </article>
    <article v-if="currentState" :class="POI_CALLOUT['brand-orange']">
      <h3 :class="POI_CALLOUT_LABEL">
        {{ t('community_poi.goal_state.current') }}
      </h3>
      <p :class="POI_CALLOUT_BODY">{{ currentState }}</p>
    </article>
  </section>
</template>
