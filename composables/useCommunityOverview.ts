import type { Locale } from '#layers/content-core'
import type { CommunityNumbers, CommunityOverview } from '#layers/community/types'

const emptyOverview = (): CommunityOverview => ({ teamSize: 0, buildCount: 0, contributors: [] })

/**
 * The community page's and the home strip's numbers and contributors. Lives at
 * the root because it reads four domains (community POIs, events, team,
 * OpenCollective), which no layer may know about each other.
 *
 * The overview is decided inside the data handler, so `now` is fixed on the
 * server and travels in the payload; the browser never asks the clock again.
 */
export function useCommunityOverview() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: base } = useAsyncData<CommunityOverview>(
    () => `community-overview-${activeLocale.value}`,
    async () => {
      const [
        pois,
        events,
        team
      ] = await Promise.all([
        repo.listCommunityPois(activeLocale.value),
        repo.listEvents(activeLocale.value),
        repo.getTeamDocument(activeLocale.value)
      ])
      return buildCommunityOverview({
        pois,
        events,
        teamSize: (team?.members ?? []).filter((member) => !member.openPosition).length,
        locale: activeLocale.value,
        now: new Date()
      })
    },
    { watch: [activeLocale], default: emptyOverview }
  )

  // Applied outside the data handler so the list can arrive after the content queries.
  const { supporters } = useLiteSupporters()
  const overview = computed(() => withSupporters(base.value, supporters.value))

  const { members: discordMembers } = useDiscordMembers()
  const { data: collective } = useOpenCollective()

  const numbers = computed<CommunityNumbers>(() => ({
    discordMembers: discordMembers.value,
    teamSize: overview.value.teamSize,
    buildCount: overview.value.buildCount,
    contributorCount: overview.value.contributors.length,
    supporters: supporters.value.length || (collective.value?.contributors ?? null)
  }))

  return { overview, numbers }
}
