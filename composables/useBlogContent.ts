import { createError, queryCollection } from '#imports'
import type { PageCollectionItemBase } from '@nuxt/content'
import type { LocaleObject } from 'vue-i18n-routing'
import type {
  BlogArticle,
  BlogAlternateLanguageLink,
  BlogAlternateHeader,
  BlogAuthorProfile
} from '~/types/blog'

type BlogCollectionKey = 'blog_de' | 'blog_en'
type HeadLink = { rel: string; href: string; hreflang?: string; type?: string }
type AuthorCollectionItem = BlogAuthorProfile & PageCollectionItemBase

declare module '@nuxt/content' {
  interface PageCollections {
    authors: AuthorCollectionItem
  }
  interface Collections {
    authors: AuthorCollectionItem
  }
}

const normalizeReleaseDate = (entry: BlogArticle): Date | null => {
  const raw = entry.releaseDate ?? entry.pubDate
  if (!raw) return null
  const parsed = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const releaseTimestamp = (entry: BlogArticle): number =>
  normalizeReleaseDate(entry)?.getTime() ?? 0

const isReleased = (entry: BlogArticle | null | undefined): entry is BlogArticle => {
  if (!entry) return false
  const release = normalizeReleaseDate(entry)
  if (!release) return true
  return release.getTime() <= Date.now()
}

const normalizeLocales = (list: unknown[]): LocaleObject[] =>
  list
    .filter(
      (locale): locale is LocaleObject =>
        Boolean(locale && typeof locale === 'object' && 'code' in (locale as Record<string, unknown>))
    )
    .map((locale) => locale as LocaleObject)

const resolveHreflang = (locale: LocaleObject, fallback: string): string =>
  locale.iso || (locale as { _hreflang?: string })._hreflang || locale.code || fallback

// Last non-empty path segment of a (possibly absolute) URL — the blog slug.
const slugFromUrl = (url: string): string | undefined => {
  try {
    const path = url.includes('://') ? new URL(url).pathname : url
    return path.split('/').filter(Boolean).at(-1)
  } catch {
    return url.split('/').filter(Boolean).at(-1)
  }
}

// Map an hreflang value (e.g. `de`, `de-DE`) back to a configured locale code.
const localeCodeFromHreflang = (
  hreflang: string,
  available: LocaleObject[]
): string | undefined => {
  const match = available.find(
    (l) => l.code === hreflang || l.iso === hreflang || hreflang.split('-')[0] === l.code
  )
  return match?.code
}

export interface BlogOverviewOptions {
  /**
   * Optional current page (1-based) for future pagination.
   * If omitted, all posts (starting from the second entry) are returned.
   */
  page?: number
  /**
   * Optional page size for future pagination.
   * If not set, no pagination is applied.
   */
  pageSize?: number
}

/**
 * Fetches blog overview data (top article + remaining posts) for the blog overview page.
 * Encapsulates i18n-aware @nuxt/content queries.
 */
export function useBlogOverview(options: BlogOverviewOptions = {}) {
  const { locale } = useI18n()
  const blogCollection = computed<BlogCollectionKey>(
    () => (`blog_${locale?.value || 'de'}`) as BlogCollectionKey
  )

  const { data: allPostsData } = useAsyncData<BlogArticle[]>(
    () => `all-posts-${locale.value}`,
    () =>
      queryCollection(blogCollection.value)
        .order('pubDate', 'DESC')
        .all(),
    { watch: [locale] }
  )

  const visiblePosts = computed<BlogArticle[]>(() => {
    const posts = (allPostsData.value || []).filter(isReleased)
    return [...posts].sort((a, b) => releaseTimestamp(b) - releaseTimestamp(a))
  })

  const top1Article = computed<BlogArticle | null>(() => visiblePosts.value[0] || null)

  const remainingPosts = computed<BlogArticle[]>(() => visiblePosts.value.slice(1))

  const page = ref(options.page ?? 1)
  const pageSize = options.pageSize

  const allPosts = computed<BlogArticle[]>(() => {
    const posts = remainingPosts.value
    if (!pageSize || pageSize <= 0) {
      return posts
    }
    const start = (page.value - 1) * pageSize
    return posts.slice(start, start + pageSize)
  })

  const totalPosts = computed(() => remainingPosts.value.length)
  const totalPages = computed(() => {
    if (!pageSize || pageSize <= 0) {
      return 1
    }
    return Math.max(Math.ceil(totalPosts.value / pageSize), 1)
  })

  return {
    top1Article,
    allPosts,
    allPostsData,
    page,
    totalPosts,
    totalPages
  }
}

/**
 * Fetches a single blog article and its translations in other languages.
 * Uses i18n information together with @nuxt/content.
 */
export async function useBlogArticle() {
  const { locale, locales } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  const blogCollection = computed<BlogCollectionKey>(
    () => (`blog_${locale?.value || 'de'}`) as BlogCollectionKey
  )
  const availableLocales = computed<LocaleObject[]>(() =>
    normalizeLocales((locales.value || []) as unknown[])
  )

  // Lets `switchLocalePath`/`<SwitchLocalePathLink>` resolve the correct
  // localized slug instead of naively reusing the current one — blog posts
  // use a different slug per language, so without this the language switcher
  // produces a 404.
  const setI18nParams = useSetI18nParams()

  // Slug derived from catch-all route param; reactive on client navigation
  const slugSegments = computed<string[]>(() => {
    const params = route.params as Record<string, string | string[] | undefined>
    const p = params?.slug
    if (Array.isArray(p) && p.length) return p.map(String)
    if (typeof p === 'string' && p.length > 0) return [p]

    const parts = (route.path || '').split('/').filter(Boolean)
    const blogIndex = parts.indexOf('blog')
    if (blogIndex !== -1) return parts.slice(blogIndex + 1)
    return []
  })

  const slug = computed<string | undefined>(() => slugSegments.value.at(-1))

  // Fetch the article and its authors in a single useAsyncData so the result
  // is fully resolved during SSR. The previous two-step approach used a
  // second useAsyncData whose cache key depended on the article's author
  // slugs — that key was empty during setup, so SSR captured an empty
  // authors list and the rendered author cards and Article JSON-LD shipped
  // without any author data.
  const { data: payload } = await useAsyncData<{
    article: BlogArticle | null
    authors: BlogAuthorProfile[]
  } | null>(
    () => `${route.path}-${locale.value}`,
    async () => {
      if (!slug.value) return null

      const doc = (await queryCollection(blogCollection.value)
        .where('slug', '=', slug.value)
        .first()) as BlogArticle | null

      // A missing or not-yet-released article is a 404. Returning a marker
      // (instead of throwing here) lets us raise a single fatal error after
      // the data resolves, which reliably renders the error page with the
      // correct HTTP status during SSR.
      if (!doc || !isReleased(doc)) {
        return { article: null, authors: [] }
      }

      const slugs = (Array.isArray(doc.author) ? doc.author : [doc.author])
        .filter(Boolean)
        .map((s) => String(s))

      const authorDocs = slugs.length
        ? await Promise.all(
          slugs.map((authorSlug) =>
            queryCollection('authors')
              .where('slug', '=', authorSlug)
              .first()
          )
        )
        : []

      return {
        article: doc,
        authors: (authorDocs.filter(Boolean) as AuthorCollectionItem[]) || []
      }
    },
    { watch: [locale, slug] }
  )

  // A requested slug that resolves to no (released) article must surface a
  // real 404 page instead of silently rendering an empty article.
  if (slug.value && !payload.value?.article) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
  }

  const article = computed<BlogArticle | null>(() => payload.value?.article || null)
  const authors = computed<BlogAuthorProfile[]>(() => payload.value?.authors || [])

  const blog = computed<BlogArticle | null>(() => {
    if (!article.value) return null
    return { ...(article.value as BlogArticle), authors: authors.value || [] }
  })

  const alternateLanguages = ref<BlogAlternateLanguageLink[]>([])

  // Helper to resolve a base URL
  const resolveBaseUrl = (): string => {
    const pub = config.public as { siteUrl?: string; baseUrl?: string }
    return pub.siteUrl || pub.baseUrl || 'https://onelitefeather.net'
  }

  // Push the per-locale slugs into Nuxt i18n so the language switcher links
  // to the translated article URL rather than reusing the current slug.
  const publishLocaleParams = (localeSlugs: Record<string, string>) => {
    const params: Record<string, { slug: string[] }> = {}
    for (const [code, value] of Object.entries(localeSlugs)) {
      if (value) params[code] = { slug: [value] }
    }
    if (Object.keys(params).length) setI18nParams(params)
  }

  // Rebuild alternates whenever article/locale changes
  watch([blog, locale, locales], async () => {
    alternateLanguages.value = []
    if (!blog.value) return

    // Always know the current locale's own slug.
    const localeSlugs: Record<string, string> = {}
    if (blog.value.slug) localeSlugs[locale.value] = blog.value.slug

    if (blog.value.alternates && Array.isArray(blog.value.alternates)) {
      for (const alt of blog.value.alternates as BlogAlternateHeader[]) {
        if (!alt?.hreflang || !alt?.href) continue
        alternateLanguages.value.push({ locale: alt.hreflang, url: alt.href })

        const code = localeCodeFromHreflang(alt.hreflang, availableLocales.value)
        const altSlug = slugFromUrl(alt.href)
        if (code && altSlug) localeSlugs[code] = altSlug
      }
      publishLocaleParams(localeSlugs)
      return
    }

    if (!blog.value.translationKey) {
      publishLocaleParams(localeSlugs)
      return
    }

    const otherLocales = availableLocales.value.filter((l) => l.code !== locale.value)

    const baseUrl = resolveBaseUrl()
    for (const otherLocale of otherLocales) {
      const translated = await queryCollection(`blog_${otherLocale.code}` as BlogCollectionKey)
        .where('translationKey', '=', blog.value?.translationKey)
        .first()

      if (translated) {
        const hreflangValue = resolveHreflang(otherLocale, otherLocale.code)
        const translatedSlug = (translated as BlogArticle).slug

        alternateLanguages.value.push({
          locale: hreflangValue,
          url: `${baseUrl}/${otherLocale.code}/blog/${translatedSlug}`
        })
        if (translatedSlug) localeSlugs[otherLocale.code] = translatedSlug
      }
    }

    publishLocaleParams(localeSlugs)
  }, { immediate: true })

  // Canonical + hreflang Informationen für den Head
  const headLinks = computed<HeadLink[]>(() => {
    const links: HeadLink[] = []
    // add favicon
    links.push({ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' })

    if (!blog.value) return links

    const baseUrl = resolveBaseUrl()

    const currentLocaleObj =
      availableLocales.value.find((l) => l.code === locale.value) ||
      ({ code: locale.value } as LocaleObject)
    const currentHreflang = resolveHreflang(currentLocaleObj, locale.value)

    // Prefer explicit canonical from front-matter, else compute fallback
    const canonicalUrl =
      blog.value.canonical || `${baseUrl}/${locale.value}/blog/${blog.value.slug}`

    links.push({ rel: 'canonical', href: canonicalUrl })

    // Build a de-dup set for alternates
    const seen = new Set<string>()
    const pushAlt = (hreflang: string, href: string) => {
      const key = `${hreflang}::${href}`
      if (seen.has(key)) return
      seen.add(key)
      links.push({ rel: 'alternate', hreflang, href })
    }

    if (blog.value.alternates && Array.isArray(blog.value.alternates)) {
      for (const alt of blog.value.alternates as BlogAlternateHeader[]) {
        if (!alt?.hreflang || !alt?.href) continue
        pushAlt(alt.hreflang, alt.href)
      }
      // Ensure current locale is present
      const hasCurrent = [...seen].some((k) => k.startsWith(`${currentHreflang}::`))
      if (!hasCurrent) pushAlt(currentHreflang, canonicalUrl)
    } else {
      // Fallback: generate alternates programmatically from computed ref
      pushAlt(currentHreflang, canonicalUrl)
      for (const alt of alternateLanguages.value) pushAlt(alt.locale, alt.url)

      const defaultLocale = 'en'
      if (locale.value === defaultLocale) {
        pushAlt('x-default', canonicalUrl)
      } else {
        const defaultLocaleUrl =
          alternateLanguages.value.find(
            (alt) => alt.locale?.startsWith('en') || alt.locale === 'en'
          )?.url || `${baseUrl}/${defaultLocale}/blog/${blog.value.slug}`
        pushAlt('x-default', defaultLocaleUrl)
      }
    }

    return links
  })

  return {
    blog,
    authors,
    alternateLanguages,
    headLinks
  }
}
