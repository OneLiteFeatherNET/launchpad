import type { PageSeoOptions } from '~/types/seo'

export function usePageSeo(opts: PageSeoOptions = {}) {
  const { locale, locales, t } = useI18n()
  const route = useRoute()
  const site = useSiteConfig()
  const switchLocalePath = useSwitchLocalePath()
  const img = useImage()

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
    // x-default always points to the English locale URL (defaultLocale in nuxt.config.ts)
    const enPath = switchLocalePath('en') || '/'
    const enHref = new URL(enPath, site.url).toString()
    items.push({ rel: 'alternate', hreflang: 'x-default', href: enHref })
    return items
  })

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ...alternateLinks.value
    ],
    meta: opts.robots ? [{ name: 'robots', content: opts.robots }] : []
  }))

  // Social preview image for OG/Twitter
  const socialImage = computed(() =>
    opts.image
      ? img(opts.image, { width: 1200, height: 630, format: 'webp', quality: 80 })
      : undefined
  )

  const pageTitle = computed(() => opts.title || site.name)
  const pageDescription = computed(() => {
    if (opts.description) return opts.description
    if (site.description) return site.description
    return t('seo.default_description')
  })

  // Resolve og:locale from the current locale code
  const currentLocaleObj = computed(() => {
    const all = Array.isArray(locales.value) ? locales.value : []
    return (all as Array<any>).find(
      l => (typeof l === 'string' ? l : l.code) === locale.value
    )
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

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: opts.ogType || 'website',
    ogUrl: canonicalUrl,
    ogImage: socialImage,
    ogImageAlt: opts.imageAlt || pageTitle,
    ogSiteName: site.name,
    ogLocale: ogLocale,
    ogLocaleAlternate: ogLocaleAlternate,
    twitterCard: opts.twitterCard || 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: socialImage
  })

  // Auto-generate OG image via nuxt-og-image for every page
  defineOgImage({
    title: opts.title || site.name || 'OneLiteFeather',
    description: pageDescription.value
  })

  useSchemaOrg(() => ({
    '@type': opts.schemaType || 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    url: canonicalUrl.value,
    inLanguage: locale?.value || 'de'
  }))
}
