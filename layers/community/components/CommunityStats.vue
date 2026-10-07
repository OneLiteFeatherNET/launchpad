<script setup lang="ts">
import type { CommunityNumbers } from '../types'

const props = defineProps<{
  numbers: CommunityNumbers
}>()

const { t, locale } = useI18n()

const tileClass
  = 'flex flex-col-reverse justify-end gap-1 rounded-extra-large border border-outline-variant '
    + 'bg-surface-container-low p-4 sm:p-5'

const format =(value: number) => new Intl.NumberFormat(locale.value).format(value)

// A missing Discord or supporter count drops its tile instead of showing a dash.
const tiles = computed(() => [
  { key: 'discord', label: t('community.stats.discord'), value: props.numbers.discordMembers },
  { key: 'team', label: t('community.stats.team'), value: props.numbers.teamSize },
  { key: 'builds', label: t('community.stats.builds'), value: props.numbers.buildCount },
  { key: 'contributors', label: t('community.stats.contributors'), value: props.numbers.contributorCount },
  { key: 'supporters', label: t('community.stats.supporters'), value: props.numbers.supporters }
].filter((tile): tile is typeof tile & { value: number } => tile.value !== null))
</script>

<template>
  <dl class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3 md:gap-4">
    <div
      v-for="tile in tiles"
      :key="tile.key"
      :class="tileClass"
    >
      <dt class="text-label-large text-on-surface-variant">{{ tile.label }}</dt>
      <dd class="text-headline-medium font-bold text-on-surface">{{ format(tile.value) }}</dd>
    </div>
  </dl>
</template>
