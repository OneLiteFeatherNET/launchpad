<script setup lang="ts">
import type { EventCardData } from '../utils/eventLists'

/** One event in a list: the whole card links to its detail page. */
const props = withDefaults(defineProps<{
  card: EventCardData
  headingLevel?: 2 | 3 | 4
}>(), {
  headingLevel: 3,
})

const { t } = useI18n()
</script>

<template>
  <M3Card as="li" variant="elevated" interactive>
    <template v-if="props.card.thumbnail" #media>
      <NuxtPicture
        class="block"
        :src="props.card.thumbnail"
        :alt="props.card.thumbnailAlt ?? ''"
        width="640"
        height="360"
        sizes="xs:100vw sm:50vw lg:400px"
        fit="cover"
        loading="lazy"
        format="avif,webp"
        :img-attrs="{ class: 'aspect-video w-full object-cover' }"
      />
    </template>
    <component :is="`h${props.headingLevel}`" class="text-title-medium text-on-surface">
      <M3CardLink :to="props.card.path">{{ props.card.title }}</M3CardLink>
    </component>
    <div class="mt-2 flex flex-wrap gap-2">
      <M3Chip kind="label" :label="t(`events.type.${props.card.type}`)" />
      <EventPhaseChip v-if="props.card.phase !== 'hidden'" :phase="props.card.phase" />
      <EventAccessChip :mode="props.card.accessMode" />
    </div>
    <p class="mt-2 text-body-medium text-on-surface-variant">{{ props.card.summary }}</p>
    <p v-if="props.card.winner" class="mt-2 text-label-large text-primary">
      {{ t('events.results.winner', { name: props.card.winner }) }}
    </p>
    <p class="mt-auto pt-2 text-label-large text-on-surface-variant">
      <DateRange :start="props.card.startsAt" :end="props.card.endsAt" />
    </p>
  </M3Card>
</template>
