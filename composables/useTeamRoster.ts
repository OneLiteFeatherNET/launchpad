import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type { TeamDocument, TeamMember, TeamRank } from '~/types/team'
import { TEAM_RANK_ORDER } from '~/types/team'

export interface TeamRankGroup {
  rank: TeamRank
  members: TeamMember[]
  openPositions: TeamMember[]
}

/**
 * Loads the team roster for the active locale and groups it by rank in the
 * fixed {@link TEAM_RANK_ORDER}. Open positions are kept separate from real
 * members so the page can render them as "join us" cards within each section.
 * Entries without a known rank fall back to the last section.
 */
export function useTeamRoster() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: teamDoc } = useAsyncData<TeamDocument | null>(
    () => `team-roster-${activeLocale.value}`,
    () => repo.getTeamDocument(activeLocale.value),
    { watch: [activeLocale] }
  )

  const groups = computed<TeamRankGroup[]>(() => {
    const list = (teamDoc.value?.members || []) as TeamMember[]
    const fallback = TEAM_RANK_ORDER[TEAM_RANK_ORDER.length - 1]
    return TEAM_RANK_ORDER.map((rank) => {
      const inRank = list.filter((m) => {
        const r = (m.rank as TeamRank | undefined) ?? fallback
        return r === rank
      })
      return {
        rank,
        members: inRank.filter((m) => !m.openPosition),
        openPositions: inRank.filter((m) => m.openPosition)
      }
    }).filter((g) => g.members.length > 0 || g.openPositions.length > 0)
  })

  const memberCount = computed(() => groups.value.reduce((sum, g) => sum + g.members.length, 0))

  const bySlug = computed<Record<string, TeamMember>>(() => {
    const map: Record<string, TeamMember> = {}
    for (const m of (teamDoc.value?.members || []) as TeamMember[]) {
      if (m.slug) map[m.slug] = m
    }
    return map
  })

  return { groups, memberCount, bySlug }
}
