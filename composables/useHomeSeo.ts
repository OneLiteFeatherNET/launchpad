type HomeSeoOptions = {
  title?: string
  description?: string
  image?: string
}

export function useHomeSeo(opts: HomeSeoOptions = {}) {
  const { locale, locales } = useI18n()
  const route = useRoute()
  const site = useSiteConfig()
  const switchLocalePath = useSwitchLocalePath()

  const canonicalUrl = computed(() => new URL(route.fullPath || '/', site.url).toString())

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
    // x-default falls back to current locale URL
    items.push({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl.value })
    return items
  })

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
      // Favicon kept for consistency
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ...alternateLinks.value
    ]
  }))

  // Social preview image for OG/Twitter
  const img = useImage()
  const socialImage = computed(() =>
    opts.image
      ? img(opts.image, { width: 1200, height: 630, format: 'webp', quality: 80 })
      : img('images/logo.svg', { width: 1200, height: 630, format: 'webp', quality: 80 })
  )

  const pageTitle = computed(() => opts.title || site.name)
  const pageDescription = computed(() =>
    opts.description ||
    'OneLiteFeather is a Minecraft Network sharing development tools with the community.'
  )

  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription.value,
    ogTitle: pageTitle.value,
    ogDescription: pageDescription.value,
    ogType: 'website',
    ogUrl: canonicalUrl.value,
    ogImage: socialImage.value,
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle.value,
    twitterDescription: pageDescription.value,
    twitterImage: socialImage.value
  })

  useSchemaOrg(() => ({
    '@type': 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    url: canonicalUrl.value,
    inLanguage: (locale?.value || 'de')
  }))
}
