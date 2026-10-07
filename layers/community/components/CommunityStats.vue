<script setup lang="ts">
import type { CommunityNumbers } from '../types'

const props = withDefaults(defineProps<{
  numbers: CommunityNumbers
  /** The strip on the home page never shows contributors. */
  variant?: 'page' | 'strip'
}>(), { variant: 'page' })

const { t, locale } = useI18n()

const tileClass
  = 'flex flex-col-reverse justify-end gap-1 rounded-extra-large border border-outline-variant '
    + 'bg-surface-container-low p-4 sm:p-5'

const format = (value: number) => new Intl.NumberFormat(locale.value).format(value)

// A missing or zero count drops its tile instead of showing a dash or a 0.
const tiles = computed(() => {
  const { numbers } = props
  const contributors = props.variant === 'page'
    && numbers.contributorCount >= MIN_CONTRIBUTORS_SHOWN
    ? numbers.contributorCount
    : null
  return [
    { key: 'discord', label: t('community.stats.discord'), value: numbers.discordMembers },
    { key: 'team', label: t('community.stats.team'), value: numbers.teamSize },
    { key: 'builds', label: t('community.stats.builds'), value: numbers.buildCount },
    { key: 'contributors', label: t('community.stats.contributors'), value: contributors },
    { key: 'supporters', label: t('community.stats.supporters'), value: numbers.supporters }
  ].filter((tile): tile is typeof tile & { value: number } => Boolean(tile.value))
})
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
