// Public API of the content-core layer.
export { useContentRepository } from './composables/useContentRepository'
export { usePageSeo } from './composables/usePageSeo'
export { useBreadcrumbs } from './composables/useBreadcrumbs'
export { COMMUNITY_POI_STATUS_ORDER } from './utils/content/repository'
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
  CommunityPoiDocument
} from './utils/content/repository'
// From `./utils/content/locales`, not `./utils/content/collections`: the
// latter also imports `defineCollection` from `@nuxt/content` for its
// build-time collection factories, and this layer's own index is now
// imported for a real value (`COMMUNITY_POI_STATUS_ORDER`) rather than only
// for types — the first thing in this codebase to do so. A value import of
// this barrel pulls in everything it re-exports as a value, and
// `collections.ts` would have dragged @nuxt/content's entry point into the
// client bundle, which the `impound` plugin refuses (verified with
// `nuxi build`). `locales.ts` exists precisely to hold the same two exports
// without that dependency — see its own comment.
export { locales } from './utils/content/locales'
export type { Locale } from './utils/content/locales'
export type * from './types'
