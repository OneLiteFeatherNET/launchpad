import { createError } from '#imports'
import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type { TeamDocument, TeamMember } from '~/types/team'
import { teamAvatarUrl } from '~/utils/teamAvatar'

/**
 * Resolves the active team member synchronously on SSR by awaiting the
 * underlying `useAsyncData` call. This is what lets `usePageSeo` see the
 * real member name/bio when it runs in the page's setup — without the
 * await, meta tags ship with the "Team" fallback because the member ref
 * is still null at SSR render time.
 */
export async function useTeamProfile(slugOverride?: string) {
  const route = useRoute()
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const slug = computed(() => slugOverride ?? (route.params.slug as string))

  const { data: teamDoc } = await useAsyncData<TeamDocument | null>(
    () => `team-profile-${activeLocale.value}`,
    () => repo.getTeamDocument(activeLocale.value),
    { watch: [activeLocale] }
  )

  const member = computed<TeamMember | null>(() => {
    const list = teamDoc.value?.members || []
    return (list as TeamMember[]).find((m) => m.slug === slug.value) || null
  })

  // A slug matching no member has to surface a real 404. Rendering the
  // placeholder answered HTTP 200 for every string anyone appended to /team/,
  // an unbounded space of indexable thin pages.
  //
  // Thrown here rather than inside the fetcher, and after the await above, so
  // the document is resolved and `member` is final — the ordering
  // useBlogContent uses. `fatal: true` is what makes Nuxt replace the route
  // with the error page; without it the response stays 200 and the soft 404
  // survives.
  if (slug.value && !member.value) {
    throw createError({ statusCode: 404, statusMessage: 'Team member not found', fatal: true })
  }

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
