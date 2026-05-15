import { navConfig, type NavConfigEntry, type NavLinkConfig } from '~/components/features/navigation/navItems'

/**
 * Emits a `SiteNavigationElement[]` JSON-LD payload describing the main
 * navigation. Helps Google understand the site structure and is one of the
 * signals it uses when picking sitelinks for the brand SERP. The group
 * entries (e.g. "More") are flattened so each reachable destination shows
 * up as an own element.
 */
export function useSiteNavigationSchema() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const site = useSiteConfig()

  const flatten = (entries: NavConfigEntry[]): NavLinkConfig[] => {
    const out: NavLinkConfig[] = []
    for (const entry of entries) {
      if (entry.type === 'link') out.push(entry)
      else out.push(...entry.children)
    }
    return out
  }

  const resolveUrl = (link: NavLinkConfig): string | undefined => {
    if (link.external && link.path) return link.path
    let base: string | undefined
    if (link.routeName) {
      // useLocalePath returns the canonical locale-prefixed path.
      base = localePath({ name: link.routeName })
    } else if (link.path) {
      base = link.path.startsWith('/') ? `/${locale.value}${link.path}` : link.path
    }
    if (!base) return undefined
    const withHash = link.hash ? `${base}${link.hash}` : base
    try {
      return new URL(withHash, site.url).toString()
    } catch {
      return withHash
    }
  }

  const elements = computed(() => {
    return flatten(navConfig)
      .map((link) => {
        const url = resolveUrl(link)
        if (!url) return null
        return {
          '@type': 'SiteNavigationElement' as const,
          name: t(link.textKey),
          url
        }
      })
      .filter(<T>(v: T | null): v is T => v !== null)
  })

  useSchemaOrg(() => elements.value)
}
