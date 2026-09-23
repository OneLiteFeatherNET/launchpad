// Type-only public surface of the content-core layer, reachable as
// `#layers/content-core/types`. Every statement here is `export type`, so
// importing it never loads a composable into the importer's type program —
// which the barrel `index.ts` does, even through `import type`. Server code
// and other layers' `types.ts` import from here, never from the barrel
// (enforced by tests/architecture/module-boundaries.spec.ts).
export type * from './types-seo'
export type * from './types-faq'
export type * from './types-ast'
export type {
  ContentRepository,
  SponsorsDocument,
  TeamDocument,
  BlogArticle,
  BlogAuthorProfile,
  BlogAlternateHeader,
  ServerConceptDocument,
  ServerConnectDocument,
  HomeCarouselDocument,
  CommunityPoiDocument,
  EventDocument,
  // A value, exported as a type so dependants can derive `typeof …[number]`
  // without a runtime edge.
  COMMUNITY_POI_STATUS_ORDER
} from './utils/content/repository'
export type { Locale } from './utils/content/locales'
