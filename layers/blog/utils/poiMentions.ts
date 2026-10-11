import { communityPoiCreativeWorkId, communityPoiDetailUrl } from '#shared/utils/communityPoiSchema'

/**
 * JSON-LD `mentions` for the community POIs an article embeds. Each node uses
 * the `@id` of the CreativeWork the POI page itself emits, so the two describe
 * one entity. Follows the order in which the article first embeds each POI;
 * a slug without a published POI is skipped.
 */
export function buildPoiMentions(
  siteUrl: string,
  locale: string,
  slugs: string[],
  pois: { slug: string, title: string }[]
) {
  return slugs.flatMap((slug) => {
    const poi = pois.find((candidate) => candidate.slug === slug)
    if (!poi) return []
    const url = communityPoiDetailUrl(siteUrl, locale, poi.slug)
    return [{
      '@type': 'CreativeWork' as const,
      '@id': communityPoiCreativeWorkId(url),
      name: poi.title,
      url
    }]
  })
}
