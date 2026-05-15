/**
 * Breadcrumb helper that emits a schema.org `BreadcrumbList` JSON-LD payload
 * and returns the resolved trail so pages can render a visible breadcrumb if
 * they want to. Items are resolved against the configured site URL.
 */

export interface BreadcrumbItem {
  /** Human readable label rendered in the SERP. */
  name: string
  /**
   * Absolute or relative URL. Omit on the last element — Google treats the
   * trailing item without an `item` field as the current page.
   */
  url?: string
}

export function useBreadcrumbs(items: BreadcrumbItem[] | (() => BreadcrumbItem[])) {
  const site = useSiteConfig()

  const resolved = computed<BreadcrumbItem[]>(() => {
    const raw = typeof items === 'function' ? items() : items
    return raw.filter(item => item && item.name)
  })

  const itemListElement = computed(() => resolved.value.map((item, index) => {
      const entry: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name
      }
      if (item.url) {
        try {
          entry.item = new URL(item.url, site.url).toString()
        } catch {
          entry.item = item.url
        }
      }
      return entry
    }))

  useSchemaOrg(() => ([
    {
      '@type': 'BreadcrumbList',
      itemListElement: itemListElement.value
    }
  ]))

  return { items: resolved }
}
