import { createError } from '#imports'
import type { LocaleObject } from 'vue-i18n-routing'
import type { Locale } from '#layers/content-core'
// The ordering lives in content-core beside `CommunityPoiDocument.status`,
// because `home`'s carousel needs the identical ordering — see the comment
// there. Taken from the barrel, not from `../types`: a layer's `types.ts` is
// its type-only entry point and carries no value imports.
import { COMMUNITY_POI_STATUS_ORDER } from '#layers/content-core'
import type {
  CommunityPoi,
  CommunityPoiAlternateHeader,
  CommunityPoiStatus,
  CommunityPoiSummary
} from '../types'

const updatedTimestamp = (entry: CommunityPoiSummary): number => {
  const raw = entry.updatedAt ?? entry.startedAt
  if (!raw) return 0
  const parsed = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

const slugFromUrl = (url: string): string | undefined => {
  try {
    const path = url.includes('://') ? new URL(url).pathname : url
    return path.split('/').filter(Boolean).at(-1)
  } catch {
    return url.split('/').filter(Boolean).at(-1)
  }
}

const localeCodeFromHreflang = (
  hreflang: string,
  available: LocaleObject[]
): string | undefined => {
  const match = available.find((l) => l.code === hreflang || l.language === hreflang || hreflang.split('-')[0] === l.code)
  return match?.code
}

const normalizeLocales = (list: unknown[]): LocaleObject[] => list
    .filter((locale): locale is LocaleObject => Boolean(locale && typeof locale === 'object' && 'code' in (locale as Record<string, unknown>)))
    .map((locale) => locale as LocaleObject)

function sortPoiSummaries(list: CommunityPoiSummary[]): CommunityPoiSummary[] {
  return [...list].sort((a, b) => {
    const sa = COMMUNITY_POI_STATUS_ORDER[a.status as CommunityPoiStatus] ?? 99
    const sb = COMMUNITY_POI_STATUS_ORDER[b.status as CommunityPoiStatus] ?? 99
    if (sa !== sb) return sa - sb
    return updatedTimestamp(b) - updatedTimestamp(a)
  })
}

/**
 * Loads the community POI overview for the active locale and orders entries
 * by status (active projects first), then by most recent update so the page
 * shows the freshest community work at the top.
 */
export function useCommunityPoiOverview() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: pois } = useAsyncData<CommunityPoiSummary[]>(
    () => `community-poi-list-${activeLocale.value}`,
    () => repo.listCommunityPois(activeLocale.value),
    { watch: [activeLocale] }
  )

  const sorted = computed<CommunityPoiSummary[]>(() => sortPoiSummaries(pois.value || []))

  const total = computed(() => sorted.value.length)

  return { pois: sorted, total }
}

/** The POIs whose `projects` names `projectSlug`, as cards, in overview order. */
export async function useCommunityPoisByProject(projectSlug: MaybeRefOrGetter<string>) {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data } = await useAsyncData<CommunityPoiSummary[]>(
    () => `community-poi-by-project-${activeLocale.value}-${toValue(projectSlug)}`,
    async () => {
      const slug = toValue(projectSlug)
      if (!slug) return []
      return sortPoiSummaries(await repo.listCommunityPoisByProject(activeLocale.value, slug))
    },
    { watch: [activeLocale, () => toValue(projectSlug)], default: () => [] }
  )

  return { pois: data }
}

/**
 * Loads a single community POI by its catch-all slug param and publishes
 * the translated slugs for every available locale, so the i18n language
 * switcher resolves to the correct localized URL.
 */
export async function useCommunityPoiDetail() {
  const { locale, locales } = useI18n()
  const route = useRoute()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)
  const availableLocales = computed<LocaleObject[]>(() => {
    const list = (locales.value || []) as unknown[]
    return normalizeLocales(list)
  })

  const setI18nParams = useSetI18nParams()

  const slugSegments = computed<string[]>(() => {
    const params = route.params as Record<string, string | string[] | undefined>
    const fromParam = catchAllSegments(params?.slug)
    if (fromParam.length) return fromParam
    const parts = (route.path || '').split('/').filter(Boolean)
    const idx = parts.indexOf('community-poi')
    if (idx !== -1) return parts.slice(idx + 1)
    return []
  })

  const slug = computed<string | undefined>(() => slugSegments.value.at(-1))

  const { data: poi } = await useAsyncData<CommunityPoi | null>(
    () => `community-poi-${route.path}-${activeLocale.value}`,
    async () => {
      if (!slug.value) return null
      return repo.getCommunityPoiBySlug(activeLocale.value, slug.value)
    },
    { watch: [activeLocale, slug] }
  )

  if (slug.value && !poi.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Community POI not found',
      fatal: true
    })
  }

  const publishLocaleParams = (localeSlugs: Record<string, string>) => {
    const params: Record<string, { slug: string[] }> = {}
    for (const [code, value] of Object.entries(localeSlugs)) {
      if (value) params[code] = { slug: [value] }
    }
    if (Object.keys(params).length) setI18nParams(params)
  }

  watch([poi,
locale,
locales], async () => {
    if (!poi.value) return
    const localeSlugs: Record<string, string> = {}
    if (poi.value.slug) localeSlugs[locale.value] = poi.value.slug

    if (poi.value.alternates && Array.isArray(poi.value.alternates)) {
      for (const alt of poi.value.alternates as CommunityPoiAlternateHeader[]) {
        if (!alt?.hreflang || !alt?.href) continue
        const code = localeCodeFromHreflang(alt.hreflang, availableLocales.value)
        const altSlug = slugFromUrl(alt.href)
        if (code && altSlug) localeSlugs[code] = altSlug
      }
      publishLocaleParams(localeSlugs)
      return
    }

    const translationKey = poi.value.translationKey
    if (!translationKey) {
      publishLocaleParams(localeSlugs)
      return
    }

    const otherLocales = availableLocales.value.filter((l) => l.code !== locale.value)
    for (const other of otherLocales) {
      const translated = await repo.getCommunityPoiByTranslationKey(
        other.code as Locale,
        translationKey
      )
      if (translated?.slug) localeSlugs[other.code] = translated.slug
    }
    publishLocaleParams(localeSlugs)
  }, { immediate: true })

  return { poi }
}
