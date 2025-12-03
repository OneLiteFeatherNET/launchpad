import { createError } from '#imports'
import { queryContent } from '#content'
import type { BlogArticle, BlogAlternateLanguageLink, BlogAlternateHeader } from '~/types/blog'

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

  const { data: allPostsData } = useAsyncData<BlogArticle[]>(
    () => `all-posts-${locale.value}`,
    () => {
      // @ts-ignore queryCollection is provided by @nuxt/content
      return queryCollection('blog_' + (locale?.value || 'de'))
        .order('pubDate', 'DESC')
        .all()
    },
    { watch: [locale] }
  )

  const isReleased = (entry: BlogArticle | null | undefined) => {
    if (!entry) return false
    const release = (entry as any).releaseDate || entry.pubDate
    if (!release) return true
    return new Date(release as any).getTime() <= Date.now()
  }

  const releaseDate = (entry: BlogArticle) =>
    (entry as any).releaseDate || entry.pubDate || new Date(0).toISOString()

  const visiblePosts = computed<BlogArticle[]>(() => {
    const posts = (allPostsData.value || []).filter(isReleased)
    return posts.sort(
      (a, b) =>
        new Date(releaseDate(b) as any).getTime() -
        new Date(releaseDate(a) as any).getTime()
    )
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

  // Slug derived from catch-all route param; reactive on client navigation
  const slugSegments = computed<string[]>(() => {
    const p = (route.params as any)?.slug
    if (Array.isArray(p) && p.length) return p.map(String)
    if (typeof p === 'string' && p.length > 0) return [p]

    const parts = (route.path || '').split('/').filter(Boolean)
    const blogIndex = parts.indexOf('blog')
    if (blogIndex !== -1) return parts.slice(blogIndex + 1)
    return []
  })

  const slug = computed<string | undefined>(() => slugSegments.value.at(-1))
  const contentPath = computed(
    () => `/${['blog', locale.value, ...slugSegments.value].filter(Boolean).join('/')}`
  )

  const { data: article } = useAsyncData<BlogArticle | null>(
    () => `${route.path}-${locale.value}`,
    async () => {
      if (!slug.value) return null

      const doc = await queryContent(`blog/${locale.value}`)
        .where('_path', '=', contentPath.value)
        .findOne()

      const isReleased = (entry: BlogArticle | null | undefined) => {
        if (!entry) return false
        const release = (entry as any).releaseDate || entry.pubDate
        if (!release) return true
        return new Date(release as any).getTime() <= Date.now()
      }

      if (doc && !isReleased(doc as BlogArticle)) {
        throw createError({ statusCode: 404, statusMessage: 'Article not released' })
      }

      return (doc as BlogArticle | null) || null
    },
    { watch: [locale, slug] }
  )

  const blog = computed<BlogArticle | null>(() => article.value)

  const alternateLanguages = ref<BlogAlternateLanguageLink[]>([])

  // Helper to resolve a base URL
  const resolveBaseUrl = () =>
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

    const otherLocales = (locales.value || []).filter((l) => {
      return typeof l === 'object' && (l as any).code !== locale.value
    })

    const baseUrl = resolveBaseUrl()
    for (const otherLocale of otherLocales as any[]) {
      if (typeof otherLocale !== 'object') continue

      // @ts-ignore queryCollection is provided by @nuxt/content
      const translated = await queryCollection(`blog_${otherLocale.code}`)
        .where('translationKey', '=', blog.value?.translationKey)
        .first()

      if (translated) {
        const hreflangValue =
          (otherLocale as any).iso ||
          (otherLocale as any)._hreflang ||
          otherLocale.code

        alternateLanguages.value.push({
          locale: hreflangValue,
          url: `${baseUrl}/${otherLocale.code}/blog/${(translated as any).slug}`
        })
      }
    }
  }, { immediate: true })

  // Canonical + hreflang Informationen für den Head
  const headLinks = computed(() => {
    const links: { rel: string; href: string; hreflang?: string; type?: string }[] = []
    // add favicon
    links.push({ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' })

    if (!blog.value) return links

    const baseUrl = resolveBaseUrl()

    const currentLocaleObj =
      ((locales.value || []) as any[]).find(
        (l: any) => typeof l === 'object' && l.code === locale.value
      ) || {}
    const currentHreflang =
      (currentLocaleObj as any).iso || (currentLocaleObj as any)._hreflang || (locale.value as any)

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
    alternateLanguages,
    headLinks
  }
}
