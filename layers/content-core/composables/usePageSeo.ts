import type { PageSeoOptions } from '../types-seo'
import { resolveSocialImage } from '../utils/socialImage'

const DEFAULT_LOCALE = 'en'

const normaliseKeywords = (input?: string | string[]): string | undefined => {
  if (!input) return undefined
  const list = Array.isArray(input)
    ? input
    : String(input).split(',')
  const cleaned = list.map(k => String(k).trim()).filter(Boolean)
  return cleaned.length ? cleaned.join(', ') : undefined
}

const buildRobots = (opts: PageSeoOptions): string | undefined => {
  if (opts.robots) return opts.robots
  if (!opts.noindex && !opts.nofollow) return undefined
  return [opts.noindex ? 'noindex' : 'index', opts.nofollow ? 'nofollow' : 'follow'].join(', ')
}

export function usePageSeo(opts: PageSeoOptions = {}) {
  const { locale, t } = useI18n()
  const route = useRoute()
  const site = useSiteConfig()
  const switchLocalePath = useSwitchLocalePath()
  const img = useImage()
  const runtime = useRuntimeConfig()

  // Absolute, query/hash-free URL. `switchLocalePath` preserves the current
  // request's query string, so without stripping it every tracking param
  // (utm/fbclid/posthog…) would spawn a distinct canonical + hreflang set
  // and Google would report duplicates / pick its own canonical.
  const cleanUrl = (path: string): string => {
    const u = new URL(path || '/', site.url)
    u.search = ''
    u.hash = ''
    return u.toString()
  }

  // Canonical must be byte-identical to this locale's self-referencing
  // hreflang entry below, otherwise the two become conflicting signals.
  const canonicalUrl = computed(() => {
    if (opts.canonical) return cleanUrl(new URL(opts.canonical, site.url).toString())
    return cleanUrl(switchLocalePath(locale.value) || route.path || '/')
  })


  const robotsDirective = computed(() => buildRobots(opts))
  const keywordsMeta = computed(() => normaliseKeywords(opts.keywords))

  // Canonical + hreflang are emitted once, app-wide, by @nuxtjs/i18n
  // (see layouts/default.vue). Here we only add page-specific robots /
  // keywords meta to avoid duplicate or conflicting link tags.
  useHead(() => {
    const meta: Array<{ name: string; content: string }> = []
    if (robotsDirective.value) meta.push({ name: 'robots', content: robotsDirective.value })
    if (keywordsMeta.value) meta.push({ name: 'keywords', content: keywordsMeta.value })
    return { meta }
  })

  // Social preview image for OG/Twitter: the page's own image, or the site
  // default — every indexable page carries one.
  const socialImage = computed(() => resolveSocialImage(
    opts.image,
    site.url,
    (src) => img(src, { width: 1200, height: 630, format: 'webp', quality: 80 })
  ))

  const pageTitle = computed(() => opts.title || site.name)
  const pageDescription = computed(() => {
    if (opts.description) return opts.description
    if (site.description) return site.description
    return t('seo.default_description')
  })

  // Resolve og:locale from the current locale code
  type SocialHandles = { twitterSite?: string; twitterCreator?: string }
  const socialHandles = (runtime.public as { social?: SocialHandles }).social
  const twitterSite = opts.twitterSite || socialHandles?.twitterSite || undefined
  const twitterCreator = opts.twitterCreator || socialHandles?.twitterCreator || twitterSite

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: opts.ogType || 'website',
    ogUrl: canonicalUrl,
    ogImage: () => socialImage.value.url,
    ogImageAlt: opts.imageAlt || pageTitle,
    ogImageWidth: opts.imageWidth || socialImage.value.width,
    ogImageHeight: opts.imageHeight || socialImage.value.height,
    ogSiteName: site.name,
    // og:locale + og:locale:alternate are emitted by @nuxtjs/i18n.
    twitterCard: opts.twitterCard || 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: () => socialImage.value.url,
    twitterImageAlt: opts.imageAlt || pageTitle,
    twitterSite,
    twitterCreator
  })

  // Auto-generate OG image via nuxt-og-image. v6 of the module changed
  // `defineOgImage` so the component name is the first positional argument;
  // passing an options object there crashes head rendering with
  // "originalName.split is not a function". The renderer suffix is spelled
  // out because the bare name is ambiguous in the module's generated types
  // (a takumi variant exists too), and satori is the renderer installed here.
  defineOgImage('NuxtSeo.satori', {
    title: opts.title || site.name || 'OneLiteFeather',
    description: pageDescription.value
  })

  // Refines the WebPage node nuxt-schema-org adds to every page (#webpage)
  // rather than adding a second one. A plain `{ '@type': … }` object here
  // used to become a separate node next to it, and the module's own WebPage
  // was left without a type — two page nodes per URL, one of them untyped.
  useSchemaOrg(() => [
    defineWebPage({
      '@type': opts.schemaType || 'WebPage',
      name: pageTitle.value,
      description: pageDescription.value,
      url: canonicalUrl.value,
      inLanguage: locale?.value || DEFAULT_LOCALE
    })
  ])
}
