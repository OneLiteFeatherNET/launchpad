import { createError } from '#imports'
import type { LocaleObject } from 'vue-i18n-routing'
import { useContentRepository } from '~/composables/useContentRepository'
import type { Locale } from '~/utils/content/collections'
import {
  COMMUNITY_POI_STATUS_ORDER,
  type CommunityPoi,
  type CommunityPoiAlternateHeader,
  type CommunityPoiStatus
} from '~/types/community-poi'

const updatedTimestamp = (entry: CommunityPoi): number => {
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
  const match = available.find((l) => l.code === hreflang || l.iso === hreflang || hreflang.split('-')[0] === l.code)
  return match?.code
}

const normalizeLocales = (list: unknown[]): LocaleObject[] => list
    .filter((locale): locale is LocaleObject => Boolean(locale && typeof locale === 'object' && 'code' in (locale as Record<string, unknown>)))
    .map((locale) => locale as LocaleObject)

/**
 * Loads the community POI overview for the active locale and orders entries
 * by status (active projects first), then by most recent update so the page
 * shows the freshest community work at the top.
 */
export function useCommunityPoiOverview() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: pois } = useAsyncData<CommunityPoi[]>(
    () => `community-poi-list-${activeLocale.value}`,
    () => repo.listCommunityPois(activeLocale.value),
    { watch: [activeLocale] }
  )

  const sorted = computed<CommunityPoi[]>(() => {
    const list = pois.value || []
    return [...list].sort((a, b) => {
      const sa = COMMUNITY_POI_STATUS_ORDER[a.status as CommunityPoiStatus] ?? 99
      const sb = COMMUNITY_POI_STATUS_ORDER[b.status as CommunityPoiStatus] ?? 99
      if (sa !== sb) return sa - sb
      return updatedTimestamp(b) - updatedTimestamp(a)
    })
  })

  const total = computed(() => sorted.value.length)

  return { pois: sorted, total }
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
    const p = params?.slug
    if (Array.isArray(p) && p.length) return p.map(String)
    if (typeof p === 'string' && p.length > 0) return [p]
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
