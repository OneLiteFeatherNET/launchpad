// The CMS-derived document shapes live in content-core, the only layer
// permitted to name @nuxt/content directly (module-boundaries.spec.ts). This
// re-exports them under the same names and derives the plain shapes this
// layer's composables actually work with.
import type {
  ServerConceptDocument,
  ServerConnectDocument,
  HomeCarouselDocument
} from '#layers/content-core'
import type { AnySlide } from './types-carousel'

export type { ServerConceptDocument, ServerConnectDocument, HomeCarouselDocument }

export type ServerConceptPoint =
  NonNullable<ServerConceptDocument['points']>[number]

export type HomeCarouselSlide = AnySlide
