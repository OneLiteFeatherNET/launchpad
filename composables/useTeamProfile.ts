import type { TeamDocument, TeamMember } from '~/types/team'

export function useTeamProfile(slugOverride?: string) {
  const route = useRoute()
  const { locale } = useI18n()

  const slug = computed(() => slugOverride ?? (route.params.slug as string))

  const { data: teamData } = useAsyncData<TeamDocument[]>(
    () => `team-profile-${locale.value}`,
    () => {
      // @ts-ignore provided by @nuxt/content
      return queryCollection('team_' + (locale?.value || 'de')).all()
    },
    { watch: [locale] }
  )

  const member = computed<TeamMember | null>(() => {
    const doc = teamData.value?.[0] as TeamDocument | undefined
    const list = doc?.members || []
    return (list as TeamMember[]).find((m) => m.slug === slug.value) || null
  })

  const avatarSrc = computed(() => {
    const m = member.value
    if (!m) return '/favicon.ico'
    if (m.avatarUrl) return m.avatarUrl
    if (m.mcName) return `https://mc-heads.net/avatar/${encodeURIComponent(m.mcName)}/256`
    return '/favicon.ico'
  })

  return {
    member,
    avatarSrc
  }
}
