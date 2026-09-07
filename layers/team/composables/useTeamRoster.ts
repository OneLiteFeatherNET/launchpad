import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Locale } from '#layers/content-core'
import type { TeamDocument, TeamMember, TeamRank } from '../types'
import { TEAM_RANK_ORDER } from '../types'

export interface TeamRankGroup {
  rank: TeamRank
  members: TeamMember[]
  openPositions: TeamMember[]
}

export interface UseTeamRosterOptions {
  /**
   * Whether the roster should actually be fetched. Defaults to `true`, so
   * every existing call site (the team page, which always needs the full
   * roster) is unaffected. A caller that only conditionally needs the
   * roster — e.g. a blog article that features specific members only when
   * its frontmatter names them — passes a reactive `false` to skip both the
   * content query and shipping the document in the SSR payload.
   */
  enabled?: MaybeRefOrGetter<boolean>
}

/**
 * Loads the team roster for the active locale and groups it by rank in the
 * fixed {@link TEAM_RANK_ORDER}. Open positions are kept separate from real
 * members so the page can render them as "join us" cards within each section.
 * Entries without a known rank fall back to the last section.
 */
export function useTeamRoster(options: UseTeamRosterOptions = {}) {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)
  const enabled = computed(() => toValue(options.enabled ?? true))

  const { data: teamDoc } = useAsyncData<TeamDocument | null>(
    () => `team-roster-${activeLocale.value}`,
    () => (enabled.value ? repo.getTeamDocument(activeLocale.value) : Promise.resolve(null)),
    { watch: [activeLocale, enabled] }
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
