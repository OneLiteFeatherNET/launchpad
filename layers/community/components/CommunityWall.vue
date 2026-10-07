<script setup lang="ts">
import type { Contribution, Contributor } from '../types'

defineProps<{
  contributors: Contributor[]
}>()

const { t } = useI18n()

const personClass
  = 'flex items-start gap-4 rounded-extra-large border border-outline-variant '
    + 'bg-surface-container-low p-4'

const badgeLabel =(contribution: Contribution) => contribution.kind === 'build'
  ? t('community.wall.badge_build', { title: contribution.title })
  : t('community.wall.badge_event', { place: contribution.place, title: contribution.title })
</script>

<template>
  <section v-if="contributors.length" aria-labelledby="community-wall-title">
    <h2 id="community-wall-title" class="text-headline-small font-bold text-on-surface">
      {{ t('community.wall.title') }}
    </h2>
    <p class="mt-2 max-w-3xl text-body-large text-on-surface-variant">
      {{ t('community.wall.intro') }}
    </p>
    <ul class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="person in contributors"
        :key="person.key"
        :class="personClass"
      >
        <NuxtImg
          :src="teamAvatarUrl({ mcName: person.mcName }, 128)"
          alt=""
          width="56"
          height="56"
          fit="cover"
          format="avif,webp"
          quality="80"
          densities="x1 x2"
          class="size-14 shrink-0 rounded-medium bg-surface-container-highest object-cover"
          loading="lazy"
          decoding="async"
        />
        <div class="min-w-0">
          <p class="truncate text-title-medium text-on-surface">{{ person.name }}</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li
              v-for="contribution in person.contributions"
              :key="`${contribution.kind}-${contribution.path}`"
            >
              <M3Chip :to="contribution.path" :label="badgeLabel(contribution)" />
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>
