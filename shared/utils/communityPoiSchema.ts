// schema.org identifiers of a community POI. The POI page emits these nodes
// and the blog's `mentions` reference them, so both must build the same string.

export const communityPoiDetailUrl = (siteUrl: string, locale: string, slug: string): string =>
  new URL(`/${locale}/community-poi/${slug}`, siteUrl).toString()

export const communityPoiCreativeWorkId = (detailUrl: string): string => `${detailUrl}#creativework`

export const communityPoiPlaceId = (detailUrl: string): string => `${detailUrl}#place`
