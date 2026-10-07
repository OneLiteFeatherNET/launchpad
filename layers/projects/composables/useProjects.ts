import { createError } from '#imports'
import type { LocaleObject } from 'vue-i18n-routing'
import type { Locale, Person } from '#layers/content-core'
import type { ProjectDocument, ProjectSummary } from '../types'
import { sortProjects } from '../utils/projectLists'

const useActiveLocale = () => {
  const { locale } = useI18n()
  return computed<Locale>(() => (locale?.value || 'de') as Locale)
}

/** The overview's projects for the active locale, active ones first. */
export async function useProjectsOverview() {
  const activeLocale = useActiveLocale()
  const repo = useContentRepository()

  const { data } = await useAsyncData<ProjectSummary[]>(
    () => `projects-list-${activeLocale.value}`,
    async () => sortProjects(await repo.listProjects(activeLocale.value)),
    { watch: [activeLocale], default: () => [] }
  )

  return { projects: data }
}

/** The projects named by `slugs`, in that order; unknown slugs are dropped. */
export async function useProjectsBySlugs(slugs: MaybeRefOrGetter<string[]>) {
  const activeLocale = useActiveLocale()
  const repo = useContentRepository()

  const { data } = await useAsyncData<ProjectSummary[]>(
    () => `projects-by-slugs-${activeLocale.value}-${toValue(slugs).join(',')}`,
    async () => {
      const wanted = toValue(slugs)
      if (!wanted.length) return []
      const found = await repo.listProjectsBySlugs(activeLocale.value, wanted)
      return wanted
        .map((slug) => found.find((project) => project.slug === slug))
        .filter((project): project is ProjectSummary => project !== undefined)
    },
    { watch: [activeLocale, () => toValue(slugs).join(',')], default: () => [] }
  )

  return { projects: data }
}

export interface ProjectDetail {
  project: ProjectDocument
  /** The people named in `maintainers`, in frontmatter order; unresolvable slugs are dropped. */
  maintainers: Person[]
  /**
   * Slug of this project per locale; `null` without a translation — not
   * `undefined`, which the payload would drop along with the locale.
   */
  localeSlugs: Record<string, string | null>
}

const normalizeLocales = (list: unknown[]): LocaleObject[] => list
  .filter((locale): locale is LocaleObject => Boolean(locale && typeof locale === 'object' && 'code' in (locale as Record<string, unknown>)))
  .map((locale) => locale as LocaleObject)

/**
 * One project by the catch-all slug; an unknown slug answers 404. Publishes
 * the slug of each translation to the language switcher and the hreflang
 * links; a locale without a translation gets an empty slug, which resolves to
 * that locale's overview instead of a guessed URL that would 404.
 */
export async function useProjectDetail() {
  const { locales } = useI18n()
  const activeLocale = useActiveLocale()
  const route = useRoute()
  const repo = useContentRepository()
  const setI18nParams = useSetI18nParams()

  const slug = computed<string | undefined>(() => {
    const param = (route.params as Record<string, string | string[] | undefined>).slug
    return catchAllSegments(param).at(-1)
  })

  const { data: detail } = await useAsyncData<ProjectDetail | null>(
    () => `project-${activeLocale.value}-${slug.value}`,
    async () => {
      if (!slug.value) return null
      const project = await repo.getProjectBySlug(activeLocale.value, slug.value)
      if (!project) return null
      const localeSlugs: Record<string, string | null> = { [activeLocale.value]: project.slug }
      for (const other of normalizeLocales((locales.value || []) as unknown[])) {
        if (other.code === activeLocale.value) continue
        const translated = project.translationKey
          ? await repo.getProjectByTranslationKey(other.code as Locale, project.translationKey)
          : null
        localeSlugs[other.code] = translated?.slug ?? null
      }
      return {
        project,
        maintainers: await resolvePeople(project.maintainers ?? [], activeLocale.value),
        localeSlugs
      }
    },
    { watch: [activeLocale, slug] }
  )

  if (!detail.value) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
  }

  watch(detail, (current) => {
    if (!current) return
    const params: Record<string, { slug: string[] }> = {}
    for (const [code, localized] of Object.entries(current.localeSlugs)) {
      params[code] = { slug: localized ? [localized] : [] }
    }
    setI18nParams(params)
  }, { immediate: true })

  return { detail }
}
