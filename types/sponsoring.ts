import type { SponsorsDeCollectionItem, SponsorsEnCollectionItem } from '@nuxt/content'

export type SponsorsDocument = SponsorsDeCollectionItem | SponsorsEnCollectionItem
export type SponsorEntry = NonNullable<SponsorsDocument['sponsors']>[number]
