import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type { TeamDocument, TeamMember } from '~/types/team'

export function useTeamProfile(slugOverride?: string) {
  const route = useRoute()
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const slug = computed(() => slugOverride ?? (route.params.slug as string))

  const { data: teamDoc } = useAsyncData<TeamDocument | null>(
    () => `team-profile-${activeLocale.value}`,
    () => repo.getTeamDocument(activeLocale.value),
    { watch: [activeLocale] }
  )

  const member = computed<TeamMember | null>(() => {
    const list = teamDoc.value?.members || []
    return (list as TeamMember[]).find((m) => m.slug === slug.value) || null
  })

  const avatarSrc = computed(() => {
    const m = member.value
    if (!m) return '/favicon.svg'
    if (m.avatarUrl) return m.avatarUrl
    if (m.mcName) return `https://mc-heads.net/avatar/${encodeURIComponent(m.mcName)}/256`
    return '/favicon.svg'
  })

  return {
    member,
    avatarSrc
  }
}
