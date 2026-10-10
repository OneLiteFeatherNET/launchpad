<script setup lang="ts">
import type { Contribution, Contributor } from '../types'

defineProps<{
  contributors: Contributor[]
}>()

const { t } = useI18n()

const personClass
  = 'flex scroll-mt-24 items-start gap-4 rounded-extra-large border border-outline-variant '
    + 'bg-surface-container-low p-4 target:border-primary target:ring-2 target:ring-primary'
const initialClass
  = 'flex size-14 shrink-0 items-center justify-center rounded-medium bg-primary-container '
    + 'text-headline-small font-bold text-on-primary-container'

const badgeLabel = (contribution: Contribution) => {
  if (contribution.kind === 'build') return t('community.wall.badge_build', { title: contribution.title })
  if (contribution.kind === 'event') {
    return t('community.wall.badge_event', { place: contribution.place, title: contribution.title })
  }
  return t('community.wall.badge_supporter')
}

const badgeLink = (contribution: Contribution, name: string) => contribution.kind === 'supporter'
  ? { href: contribution.path, target: '_blank', 'aria-label': t('community.wall.badge_supporter_aria', { name }) }
  : { to: contribution.path }

/** Minecraft head with an `mcName`, else the supporter's avatar, else (supporters) an initial. */
const avatarOf = (person: Contributor): string | null => {
  if (person.mcName) return teamAvatarUrl({ mcName: person.mcName }, 128)
  if (person.avatarUrl) return person.avatarUrl
  return person.contributions.every((c) => c.kind === 'supporter') ? null : teamAvatarUrl({}, 128)
}
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
        :id="person.anchor"
        :key="person.key"
        :class="personClass"
      >
        <NuxtImg
          v-if="avatarOf(person)"
          :src="avatarOf(person)!"
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
        <span v-else :class="initialClass" aria-hidden="true">
          {{ person.name.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0">
          <p class="truncate text-title-medium text-on-surface">{{ person.name }}</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li
              v-for="contribution in person.contributions"
              :key="`${contribution.kind}-${contribution.path}`"
            >
              <M3Chip
                v-bind="badgeLink(contribution, person.name)"
                :label="badgeLabel(contribution)"
              />
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>
