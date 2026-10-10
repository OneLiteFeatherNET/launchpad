import type { Locale } from '../utils/content/locales'
import { resolvePersonFrom, type Person } from '../utils/content/person'

/**
 * Resolves slugs to people in slug order, skipping unknown ones. Plain async
 * function, not a composable, so it is safe inside `useAsyncData` handlers.
 */
export async function resolvePeople(slugs: string[], locale: Locale): Promise<Person[]> {
  if (!slugs.length) return []
  const repo = useContentRepository()
  const team = await repo.getTeamDocument(locale)
  const rostered = new Set((team?.members ?? []).map((m) => m.slug))
  const outsiders = slugs.filter((slug) => !rostered.has(slug))
  const authors = outsiders.length ? await repo.listAuthorsBySlugs(outsiders) : []
  return slugs
    .map((slug) => resolvePersonFrom(slug, locale, { team, authors }))
    .filter((person): person is Person => person !== null)
}

export async function resolvePerson(slug: string, locale: Locale): Promise<Person | null> {
  return (await resolvePeople([slug], locale))[0] ?? null
}

/** Resolves people during setup so SSR renders them; one query set per call. */
export async function usePeople(slugs: MaybeRefOrGetter<string[]>) {
  const { locale } = useI18n()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)
  const { data } = await useAsyncData<Person[]>(
    () => `people-${activeLocale.value}-${toValue(slugs).join(',')}`,
    () => resolvePeople(toValue(slugs), activeLocale.value),
    { watch: [activeLocale], default: () => [] }
  )
  return { people: data }
}
