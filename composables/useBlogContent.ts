import type { BlogArticle, BlogAlternateLanguageLink } from '~/types/blog'

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

  const top1Article = computed<BlogArticle | null>(
    () => (allPostsData.value || [])[0] || null
  )

  const remainingPosts = computed<BlogArticle[]>(() =>
    (allPostsData.value || []).slice(1)
  )

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

  const pathParts = route.path.split('/')
  const slug = pathParts.at(3)

  const { data: article } = useAsyncData<BlogArticle | null>(
    () => `${route.path}-${locale.value}`,
    () => {
      // @ts-ignore queryCollection is provided by @nuxt/content
      return queryCollection('blog_' + (locale?.value || 'de'))
        .where('slug', '=', slug)
        .first()
    },
    { watch: [locale] }
  )

  const blog = computed<BlogArticle | null>(() => article.value)

  const alternateLanguages = ref<BlogAlternateLanguageLink[]>([])

  if (blog.value?.translationKey) {
    const otherLocales = (locales.value || []).filter((l) => {
      return typeof l === 'object' && (l as any).code !== locale.value
    })

    for (const otherLocale of otherLocales as any[]) {
      if (typeof otherLocale !== 'object') continue

      const { data: translatedArticle } = useAsyncData<BlogArticle | null>(
        `${route.path}_${otherLocale.code}`,
        () => {
          // @ts-ignore queryCollection is provided by @nuxt/content
          return queryCollection(`blog_${otherLocale.code}`)
            .where('translationKey', '=', blog.value?.translationKey)
            .first()
        }
      )

      if (translatedArticle.value) {
        const baseUrl =
          config.public.siteUrl ||
          config.public.baseUrl ||
          'https://blog.onelitefeather.net'
        const hreflangValue =
          (otherLocale as any).iso ||
          (otherLocale as any)._hreflang ||
          otherLocale.code

        alternateLanguages.value.push({
          locale: hreflangValue,
          url: `${baseUrl}/${otherLocale.code}/blog/${translatedArticle.value.slug}`
        })
      }
    }
  }

  // Canonical + hreflang Informationen für den Head
  const headLinks: { rel: string; href: string; hreflang?: string; type?: string }[] = []

  // add favicon
  headLinks.push({ rel: 'icon', type: 'image/png', href: '/favicon.png' })

  if (blog.value) {
    const baseUrl =
      config.public.siteUrl ||
      config.public.baseUrl ||
      'https://blog.onelitefeather.net'

    const currentLocaleObj =
      ((locales.value || []) as any[]).find(
        (l: any) => typeof l === 'object' && l.code === locale.value
      ) || {}
    const currentHreflang =
      currentLocaleObj.iso || currentLocaleObj._hreflang || locale.value

    const canonicalUrl = `${baseUrl}/${locale.value}/blog/${blog.value.slug}`

    headLinks.push({ rel: 'canonical', href: canonicalUrl })
    headLinks.push({ rel: 'alternate', hreflang: currentHreflang, href: canonicalUrl })

    for (const alt of alternateLanguages.value) {
      headLinks.push({ rel: 'alternate', hreflang: alt.locale, href: alt.url })
    }

    const defaultLocale = 'de'
    if (locale.value === defaultLocale) {
      headLinks.push({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl })
    } else {
      const defaultLocaleUrl =
        alternateLanguages.value.find(
          (alt) => alt.locale?.startsWith('de') || alt.locale === 'de'
        )?.url || `${baseUrl}/${defaultLocale}/${blog.value.slug}`

      headLinks.push({
        rel: 'alternate',
        hreflang: 'x-default',
        href: defaultLocaleUrl
      })
    }
  }

  return {
    blog,
    alternateLanguages,
    headLinks
  }
}
