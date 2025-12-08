import type {
  HomeCarouselDeCollectionItem,
  HomeCarouselEnCollectionItem,
  ServerConceptDeCollectionItem,
  ServerConceptEnCollectionItem,
  ServerConnectDeCollectionItem,
  ServerConnectEnCollectionItem,
  SponsorsDeCollectionItem,
  SponsorsEnCollectionItem
} from '@nuxt/content'
import type { AnySlide } from '~/types/carousel'

export type ServerConceptDocument =
  | ServerConceptDeCollectionItem
  | ServerConceptEnCollectionItem

export type ServerConceptPoint =
  NonNullable<ServerConceptDocument['points']>[number]

export type ServerConnectDocument =
  | ServerConnectDeCollectionItem
  | ServerConnectEnCollectionItem

export type HomeCarouselDocument =
  | HomeCarouselDeCollectionItem
  | HomeCarouselEnCollectionItem

export type HomeCarouselSlide = AnySlide

export type SponsorsDocument = SponsorsDeCollectionItem | SponsorsEnCollectionItem
export type SponsorEntry = NonNullable<SponsorsDocument['sponsors']>[number]
