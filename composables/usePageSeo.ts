import type { PageSeoOptions } from '~/types/seo'

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
  const { locale, locales, t } = useI18n()
  const route = useRoute()
  const site = useSiteConfig()
  const switchLocalePath = useSwitchLocalePath()
  const img = useImage()
  const runtime = useRuntimeConfig()

  const canonicalUrl = computed(() => {
    if (opts.canonical) return new URL(opts.canonical, site.url).toString()
    return new URL(route.fullPath || '/', site.url).toString()
  })

  // Build hreflang alternate links for all configured locales + x-default
  const alternateLinks = computed(() => {
    const items: Array<{ rel: 'alternate'; hreflang: string; href: string }> = []
    const all = Array.isArray(locales.value) ? locales.value : []
    for (const l of all as Array<any>) {
      const code = typeof l === 'string' ? l : l.code
      const iso = typeof l === 'string' ? l : (l.iso || l.code)
      const path = switchLocalePath(code) || '/'
      const href = new URL(path, site.url).toString()
      items.push({ rel: 'alternate', hreflang: iso, href })
    }
    // x-default points to the default locale URL (defaultLocale in nuxt.config.ts)
    const defaultPath = switchLocalePath(DEFAULT_LOCALE) || '/'
    const defaultHref = new URL(defaultPath, site.url).toString()
    items.push({ rel: 'alternate', hreflang: 'x-default', href: defaultHref })
    return items
  })

  const robotsDirective = computed(() => buildRobots(opts))
  const keywordsMeta = computed(() => normaliseKeywords(opts.keywords))

  useHead(() => {
    const meta: Array<{ name: string; content: string }> = []
    if (robotsDirective.value) meta.push({ name: 'robots', content: robotsDirective.value })
    if (keywordsMeta.value) meta.push({ name: 'keywords', content: keywordsMeta.value })
    return {
      link: [
        { rel: 'canonical', href: canonicalUrl.value },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        ...alternateLinks.value
      ],
      meta
    }
  })

  // Social preview image for OG/Twitter
  const socialImage = computed(() => opts.image
      ? img(opts.image, { width: 1200, height: 630, format: 'webp', quality: 80 })
      : undefined)

  const pageTitle = computed(() => opts.title || site.name)
  const pageDescription = computed(() => {
    if (opts.description) return opts.description
    if (site.description) return site.description
    return t('seo.default_description')
  })

  // Resolve og:locale from the current locale code
  const currentLocaleObj = computed(() => {
    const all = Array.isArray(locales.value) ? locales.value : []
    return (all as Array<any>).find(l => (typeof l === 'string' ? l : l.code) === locale.value)
  })
  const ogLocale = computed(() => {
    const l = currentLocaleObj.value
    if (!l) return locale.value
    return typeof l === 'string' ? l : (l.iso || l.code)
  })
  const ogLocaleAlternate = computed(() => {
    const all = Array.isArray(locales.value) ? locales.value : []
    return (all as Array<any>)
      .filter(l => (typeof l === 'string' ? l : l.code) !== locale.value)
      .map(l => (typeof l === 'string' ? l : (l.iso || l.code)))
  })

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
    ogImage: socialImage,
    ogImageAlt: opts.imageAlt || pageTitle,
    ogImageWidth: opts.imageWidth || (socialImage.value ? 1200 : undefined),
    ogImageHeight: opts.imageHeight || (socialImage.value ? 630 : undefined),
    ogImageType: opts.imageType || (socialImage.value ? 'image/webp' : undefined),
    ogSiteName: site.name,
    ogLocale: ogLocale,
    ogLocaleAlternate: ogLocaleAlternate,
    twitterCard: opts.twitterCard || 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: socialImage,
    twitterImageAlt: opts.imageAlt || pageTitle,
    twitterSite,
    twitterCreator
  })

  // Auto-generate OG image via nuxt-og-image. v6 of the module changed
  // `defineOgImage` so the component name is the first positional argument;
  // passing an options object there crashes head rendering with
  // "originalName.split is not a function".
  defineOgImage('NuxtSeo', {
    title: opts.title || site.name || 'OneLiteFeather',
    description: pageDescription.value
  })

  useSchemaOrg(() => ({
    '@type': opts.schemaType || 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    url: canonicalUrl.value,
    inLanguage: locale?.value || DEFAULT_LOCALE
  }))
}
