import type {
  HomeCarouselDeCollectionItem,
  HomeCarouselEnCollectionItem,
  ServerConceptDeCollectionItem,
  ServerConceptEnCollectionItem,
  ServerConnectDeCollectionItem,
  ServerConnectEnCollectionItem
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
