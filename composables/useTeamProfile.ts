import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type { TeamDocument, TeamMember } from '~/types/team'
import { teamAvatarUrl } from '~/utils/teamAvatar'

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

  // Profile hero renders the head at 96px in a 2x density box. Requesting
  // a 256px upstream render leaves headroom for retina and lets the
  // Cloudflare Images provider re-encode to AVIF/WebP at smaller sizes.
  const avatarSrc = computed(() => {
    const m = member.value
    if (!m) return '/favicon.svg'
    return teamAvatarUrl({ mcName: m.mcName, slug: m.slug, avatarUrl: m.avatarUrl }, 256)
  })

  return {
    member,
    avatarSrc
  }
}
