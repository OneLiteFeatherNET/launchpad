<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionHeading from '~/components/base/typography/SectionHeading.vue'
import TeamMemberCard from '~/components/features/home/team/TeamMemberCard.vue'
import OpenPositionCard from './OpenPositionCard.vue'
import type { TeamRankGroup } from '~/composables/useTeamRoster'

const props = defineProps<{ group: TeamRankGroup }>()

const { t, locale } = useI18n()

const rankLabel = computed(() => t(`team.ranks.${props.group.rank}`))
const headingId = computed(() => `team-rank-${props.group.rank}`)

const profileHref = (slug?: string) => slug ? `/${locale.value}/team/${slug}` : undefined
</script>

<template>
  <section :aria-labelledby="headingId" class="mt-10 first:mt-0">
    <SectionHeading :id="headingId" :level="2" :anchor="false">
      {{ rankLabel }}
    </SectionHeading>

    <ul class="mt-5 flex flex-wrap gap-4">
      <TeamMemberCard
        v-for="m in props.group.members"
        :key="m.id"
        :name="m.name"
        :role="m.role || rankLabel"
        :slogan="m.slogan"
        :mc-name="m.mcName"
        :slug="m.slug"
        :avatar-url="m.avatarUrl"
        :href="profileHref(m.slug)"
      />
      <OpenPositionCard
        v-for="p in props.group.openPositions"
        :key="p.id"
        :role="p.role || rankLabel"
        :slogan="p.slogan"
        :apply-url="p.applyUrl"
      />
    </ul>
  </section>
</template>
