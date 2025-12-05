import { createError, queryCollection } from '#imports'
import type { PageCollectionItemBase } from '@nuxt/content'
import type { LocaleObject } from 'vue-i18n'
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
export function useBlogArticle() {
  const { locale, locales } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  const blogCollection = computed<BlogCollectionKey>(
    () => (`blog_${locale?.value || 'de'}`) as BlogCollectionKey
  )
  const availableLocales = computed<LocaleObject[]>(() =>
    normalizeLocales((locales.value || []) as unknown[])
  )

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

  const { data: article } = useAsyncData<BlogArticle | null>(
    () => `${route.path}-${locale.value}`,
    async () => {
      if (!slug.value) return null

      const doc = (await queryCollection(blogCollection.value)
        .where('slug', '=', slug.value)
        .first()) as BlogArticle | null

      if (doc && !isReleased(doc)) {
        throw createError({ statusCode: 404, statusMessage: 'Article not released' })
      }

      return doc || null
    },
    { watch: [locale, slug] }
  )

  const authorSlugs = computed<string[]>(() => {
    const raw = article.value?.author
    if (!raw) return []
    return (Array.isArray(raw) ? raw : [raw]).map((s) => String(s)).filter(Boolean)
  })

  const { data: authors } = useAsyncData<BlogAuthorProfile[]>(
    () => `blog-authors-${authorSlugs.value.join('|')}`,
    async () => {
      if (!authorSlugs.value.length) return []
      const results = await Promise.all(
        authorSlugs.value.map((slug) =>
          queryCollection('authors')
            .where('slug', '=', slug)
            .first()
        )
      )
      return (results.filter(Boolean) as AuthorCollectionItem[]) || []
    },
    { watch: [authorSlugs] }
  )

  const blog = computed<BlogArticle | null>(() => {
    if (!article.value) return null
    return { ...(article.value as BlogArticle), authors: authors.value || [] }
  })

  const alternateLanguages = ref<BlogAlternateLanguageLink[]>([])

  // Helper to resolve a base URL
  const resolveBaseUrl = (): string =>
    config.public.siteUrl || config.public.baseUrl || 'https://onelitefeather.net'

  // Rebuild alternates whenever article/locale changes
  watch([blog, locale, locales], async () => {
    alternateLanguages.value = []
    if (!blog.value) return

    if (blog.value.alternates && Array.isArray(blog.value.alternates)) {
      for (const alt of blog.value.alternates as BlogAlternateHeader[]) {
        if (!alt?.hreflang || !alt?.href) continue
        alternateLanguages.value.push({ locale: alt.hreflang, url: alt.href })
      }
      return
    }

    if (!blog.value.translationKey) return

    const otherLocales = availableLocales.value.filter((l) => l.code !== locale.value)

    const baseUrl = resolveBaseUrl()
    for (const otherLocale of otherLocales) {
      const translated = await queryCollection(`blog_${otherLocale.code}` as BlogCollectionKey)
        .where('translationKey', '=', blog.value?.translationKey)
        .first()

      if (translated) {
        const hreflangValue = resolveHreflang(otherLocale, otherLocale.code)

        alternateLanguages.value.push({
          locale: hreflangValue,
          url: `${baseUrl}/${otherLocale.code}/blog/${(translated as BlogArticle).slug}`
        })
      }
    }
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

      const defaultLocale = 'de'
      if (locale.value === defaultLocale) {
        pushAlt('x-default', canonicalUrl)
      } else {
        const defaultLocaleUrl =
          alternateLanguages.value.find(
            (alt) => alt.locale?.startsWith('de') || alt.locale === 'de'
          )?.url || `${baseUrl}/${defaultLocale}/${blog.value.slug}`
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
