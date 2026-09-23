import type { Ref } from 'vue'
import type { BlogArticle, BlogAuthorProfile } from '../types'

interface BlogSeoFrontmatter {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  twitterTitle?: string
}

/**
 * Bundles every SEO concern for the blog detail page in one place: page
 * title resolution, canonical URL, social preview image, the full
 * useSeoMeta payload, the Article JSON-LD graph, breadcrumbs and the
 * NuxtSeo OG image template invocation.
 *
 * The page only consumes the few computeds it actually displays
 * (`title`, `canonicalUrl`, `previewSocial`); everything else is a side
 * effect on Unhead / nuxt-schema-org and stays out of the page setup.
 */
export function useArticleSeo(
  blog: Ref<BlogArticle | null>,
  authors: Ref<BlogAuthorProfile[]>
) {
  const { locale, t } = useI18n()
  const config = useRuntimeConfig()
  const site = useSiteConfig()
  const img = useImage()
  const { getFeatureFlag } = usePostHogFeatureFlag()

  const baseUrl = computed(() => {
    const pub = config.public as { siteUrl?: string }
    return pub.siteUrl || site.url || 'https://onelitefeather.net'
  })

  const canonicalUrl = computed(() => {
    if (!blog.value) return baseUrl.value
    return blog.value.canonical
      || `${baseUrl.value}/${locale.value}/blog/${blog.value.slug}`
  })

  const title = computed(() => {
    if (getFeatureFlag('alternative-title-conversion').value === 'test') {
      return blog.value?.alternativeTitle || blog.value?.title || t('layouts.title')
    }
    return blog.value?.title || t('layouts.title')
  })

  // og:image / twitter:image: the header image at 1200×630, or the site
  // default. The former fallback, images/logo.svg, is a format no social
  // card renders.
  const previewSocial = computed(() => resolveSocialImage(
    blog.value?.headerImage,
    baseUrl.value,
    (src) => img(src, { width: 1200, height: 630, format: 'webp', quality: 80 })
  ))

  // Multiple aspect ratios are recommended by Google for article rich results.
  const articleImages = computed(() => {
    const source = blog.value?.headerImage || 'images/logo.svg'
    return [
      img(source, { width: 1200, height: 630, format: 'webp', quality: 80 }),
      img(source, { width: 1200, height: 900, format: 'webp', quality: 80 }),
      img(source, { width: 1200, height: 1200, format: 'webp', quality: 80 })
    ]
  })

  // Compact thumbnail for SERP card previews.
  const articleThumbnail = computed(() =>
    img(blog.value?.headerImage || 'images/logo.svg', {
      width: 600,
      height: 400,
      format: 'webp',
      quality: 75
    })
  )

  // Approximate word count derived from the MDC body.
  const articleWordCount = computed(() => {
    const body = (blog.value as { body?: unknown } | null)?.body
    if (!body) return undefined
    const text = extractPlainText(body, 20_000)
    if (!text) return undefined
    const words = text.split(/\s+/).filter(Boolean).length
    return words > 0 ? words : undefined
  })

  const isoDate = (value: Date | string | undefined) =>
    value ? new Date(value).toISOString() : undefined

  // The title as it should reach <title> and the social cards: a per-article
  // `seo.title` override wins, otherwise the A/B-flagged title above.
  //
  // Exported because pages/blog/[...slug].vue re-asserts the title through its
  // own useHead — which runs after this and therefore wins. It used to pass
  // the raw `blog.title`, discarding both the override and the A/B variant.
  const metaTitle = computed(() => {
    const seo = ((blog.value as { seo?: BlogSeoFrontmatter } | null)?.seo) || {}
    return seo.title || title.value
  })

  type WithSeo = { seo?: BlogSeoFrontmatter } | null
  const seoFrontmatter = computed(() => (blog.value as WithSeo)?.seo || {})
  const metaDescription = computed(() => seoFrontmatter.value.description
    || blog.value?.description
    || extractPlainText((blog.value as { excerpt?: unknown } | null)?.excerpt)
    || '')
  const headerAlt = computed(() => blog.value?.headerImageAlt || blog.value?.title || '')

  // Document-level meta + OG/Twitter cards.
  //
  // An object of getters, not one getter returning an object: @unhead/vue v3
  // reads the keys of what it is given, and a function has none — the former
  // `useSeoMeta(() => ({ … }))` emitted nothing at all, so no article carried
  // og:image, og:type=article or article:* in production.
  useSeoMeta({
    title: () => metaTitle.value,
    ogTitle: () => seoFrontmatter.value.ogTitle || metaTitle.value,
    twitterTitle: () => seoFrontmatter.value.twitterTitle || metaTitle.value,
    description: () => metaDescription.value,
    ogDescription: () => seoFrontmatter.value.ogDescription || metaDescription.value,
    ogImage: () => previewSocial.value.url,
    ogImageWidth: () => previewSocial.value.width,
    ogImageHeight: () => previewSocial.value.height,
    ogImageAlt: () => headerAlt.value,
    twitterImage: () => previewSocial.value.url,
    twitterImageAlt: () => headerAlt.value,
    ogType: 'article',
    ogUrl: () => canonicalUrl.value,
    twitterCard: 'summary_large_image',
    articlePublishedTime: () => isoDate(blog.value?.pubDate),
    articleModifiedTime: () => isoDate(blog.value?.updatedDate) || isoDate(blog.value?.pubDate),
    articleAuthor: () => authors.value?.map((a) => a.name) || undefined,
    articleTag: () => blog.value?.tags || undefined,
    keywords: () => blog.value?.tags?.join(', ') || undefined
  })

  // Article structured data, linked to the global Organization and Person
  // entities so Google can merge identities across pages.
  useSchemaOrg(() => {
    if (!blog.value) return {}
    const article = blog.value
    return {
      '@type': 'Article',
      headline: article.title,
      description: article.description || '',
      url: canonicalUrl.value,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl.value },
      datePublished: isoDate(article.pubDate),
      dateModified: isoDate(article.updatedDate) || isoDate(article.pubDate),
      author: authors.value?.map((a) => ({
        '@type': 'Person' as const,
        '@id': a.slug ? personId(site.url, a.slug) : undefined,
        name: a.name,
        url: a.slug ? personProfileUrl(site.url, locale.value, a.slug) : undefined
      })) || [],
      image: articleImages.value,
      thumbnailUrl: articleThumbnail.value,
      wordCount: articleWordCount.value,
      articleSection: article.tags?.[0] || undefined,
      keywords: article.tags?.join(', ') || undefined,
      inLanguage: locale.value,
      publisher: { '@id': organizationId(site.url) }
    }
  })

  useBreadcrumbs(() => [
    { name: t('navigation.home'), url: `/${locale.value}` },
    { name: t('blog.overview.title'), url: `/${locale.value}/blog` },
    { name: blog.value?.title || '' }
  ])

  // nuxt-og-image v6 wants the component name as the first positional argument.
  defineOgImage('NuxtSeo', {
    title: blog.value?.title || t('blog.overview.title'),
    description: blog.value?.description || ''
  })

  return { title, metaTitle, canonicalUrl, previewSocial }
}
