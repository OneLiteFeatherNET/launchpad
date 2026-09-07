import type { Ref } from 'vue'

export interface SponsorEntry {
  name: string
  url: string
  description?: string
  logo?: string
}

/**
 * Describes a list of sponsors as schema.org Organization entities and
 * attaches them as a `sponsor` array to the OneLiteFeather Organization
 * via @id reference. Splitting this out of Sponsoring.vue keeps the view
 * focused on rendering and makes the schema reusable if another page ever
 * shows the same sponsor list.
 */
export function useSponsorSchema(sponsors: Ref<readonly SponsorEntry[]>) {
  const site = useSiteConfig()

  useSchemaOrg(() => {
    const list = sponsors.value
    if (!list?.length) return []
    const organizations = list.map((s) => ({
      '@type': 'Organization' as const,
      '@id': sponsorId(site.url, s.name),
      name: s.name,
      url: s.url,
      description: s.description || undefined,
      logo: s.logo || undefined
    }))
    return [
      ...organizations,
      {
        '@type': 'Organization' as const,
        '@id': organizationId(site.url),
        sponsor: organizations.map((o) => ({ '@id': o['@id'] }))
      }
    ]
  })
}
