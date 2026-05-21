import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import type { TeamFaqEntry } from '~/types/faq'

/**
 * Fetches the application/rank-requirement FAQ for the active locale,
 * ordered by the optional `order` frontmatter field. Kept separate from
 * the home FAQ so the two surfaces can evolve independently.
 */
export function useTeamFaqContent() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'en') as Locale)

  const { data: entries } = useAsyncData<TeamFaqEntry[]>(
    () => `team-faq-${activeLocale.value}`,
    () => repo.listTeamFaqEntries(activeLocale.value),
    { watch: [activeLocale] }
  )

  const items = computed<TeamFaqEntry[]>(() => entries.value || [])

  return { items }
}
