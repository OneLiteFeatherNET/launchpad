// Replaces the per-locale WebSite that nuxt-schema-org registers (url /en or
// /de, which Google does not support as a site name) with one for the domain.
// Nodes merge by their `#fragment`; `replace` makes ours win outright, which a
// merge could not: it would keep the module's translationOfWork links.
export default defineNuxtPlugin({
  name: 'site-identity',
  dependsOn: ['nuxt-schema-org:defaults'],
  setup(nuxtApp) {
    if (useError().value?.error) return

    const site = useSiteConfig()
    const languages = (nuxtApp.$i18n.locales.value as Array<{ language?: string }>)
      .map(locale => locale.language)
      .filter((language): language is string => Boolean(language))
    const description = () => toValue(site.description) || ''

    useHead({
      script: [{
        type: 'application/ld+json',
        key: 'schema-org-graph',
        nodes: [defineWebSite(rootWebSiteNode({
          siteUrl: site.url,
          name: () => toValue(site.name) || '',
          description,
          languages
        }))],
        tagDuplicateStrategy: 'replace',
        tagPriority: 'high'
      } as never]
    })

    // Scalars merge: the module's WebPage points isPartOf at /en#website, and
    // the organization's English description gives way to the page language's.
    const webPage = defineWebPage({ isPartOf: { '@id': websiteId(site.url) } })
    const organization = defineOrganization(organizationDescriptionNode(site.url, description))
    useSchemaOrg([webPage, organization])
  }
})
