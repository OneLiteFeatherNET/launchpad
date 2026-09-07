import type {
  SponsorsDeCollectionItem,
  SponsorsEnCollectionItem,
  BlogDeCollectionItem,
  BlogEnCollectionItem
} from '@nuxt/content'
import type { Locale } from './collections'
import type { FaqEntry, TeamFaqEntry } from '../../types-faq'
import type { TeamDocument } from '~/types/team'
import type {
  ServerConceptDocument,
  ServerConnectDocument,
  HomeCarouselDocument
} from '~/types/home'
import type { CommunityPoi } from '~/types/community-poi'

/**
 * Shape of the `sponsors` collection document, as @nuxt/content generates it.
 * Lives here rather than in the `sponsoring` layer: it is the return type of
 * this interface's `getSponsorsDocument`, and only content-core may name
 * `@nuxt/content` (enforced by module-boundaries.spec.ts). The `sponsoring`
 * layer imports this type from content-core's public API and derives its own
 * plain `SponsorEntry` shape from it.
 */
export type SponsorsDocument = SponsorsDeCollectionItem | SponsorsEnCollectionItem

/**
 * Author profile returned by `getAuthorBySlug`. Not itself CMS-derived, but
 * it lives here rather than in the `blog` layer because it is both a
 * `ContentRepository` return type and a field of `BlogArticle` below.
 */
export interface BlogAuthorProfile {
  slug: string
  name: string
  role?: string
  avatar?: string
  bio?: string
  links?: {
    website?: string
    github?: string
    twitter?: string
    linkedin?: string
    mastodon?: string
    discord?: string
  }
}

/** A single `hreflang`/`href` pair from an article's `alternates` frontmatter. */
export interface BlogAlternateHeader {
  hreflang: string
  href: string
}

interface BlogSeoOverrides {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  twitterTitle?: string
  twitterDescription?: string
}

/**
 * Shape of the `blog` collection document, as @nuxt/content generates it,
 * widened with hand-written fields. Lives here rather than in the `blog`
 * layer: it is the return type of this interface's blog methods, and only
 * content-core may name `@nuxt/content` (enforced by module-boundaries.spec.ts).
 * The `blog` layer imports this type from content-core's public API and
 * derives whatever plain shapes its composables actually work with.
 */
export type BlogArticle = (
  | BlogDeCollectionItem
  | BlogEnCollectionItem
) & {
  author?: string | string[]
  authors?: BlogAuthorProfile[]
  teamMembers?: string[]
  canonical?: string
  alternates?: BlogAlternateHeader[]
  seo?: BlogSeoOverrides
  head?: Record<string, any>
  tags?: string[]
}

/**
 * Provider-agnostic content access layer.
 *
 * Composables, pages and components MUST depend only on this interface and the
 * domain types in `~/types/*`. Everything provider-specific (collection-key
 * naming, query syntax, AST shapes) lives in the concrete adapter
 * (`nuxtContentAdapter.ts`). Switching off @nuxt/content to a headless CMS
 * later means writing a new adapter that satisfies this contract — no
 * composable/page changes required.
 *
 * Domain logic (i18n resolution, release-date filtering, sorting, SEO/hreflang
 * assembly) intentionally stays in the composables; it is provider-independent
 * and must not leak into adapters.
 */
export interface ContentRepository {
  // --- Blog -----------------------------------------------------------------
  /** All blog articles for a locale (unfiltered, unsorted — caller decides). */
  listBlogArticles(locale: Locale): Promise<BlogArticle[]>
  /** Single article by its `slug` frontmatter field, or null. */
  getBlogArticleBySlug(locale: Locale, slug: string): Promise<BlogArticle | null>
  /** Single article in `locale` sharing the given `translationKey`, or null. */
  getBlogArticleByTranslationKey(
    locale: Locale,
    translationKey: string
  ): Promise<BlogArticle | null>
  /** Author profile (locale-independent collection) by `slug`, or null. */
  getAuthorBySlug(slug: string): Promise<BlogAuthorProfile | null>

  // --- FAQ ------------------------------------------------------------------
  /** All FAQ entries for a locale, ordered by the `order` field ascending. */
  listFaqEntries(locale: Locale): Promise<FaqEntry[]>

  // --- Team -----------------------------------------------------------------
  /** The single team document for a locale, or null. */
  getTeamDocument(locale: Locale): Promise<TeamDocument | null>
  /** Team-page FAQ entries (applications, rank requirements), ordered ascending. */
  listTeamFaqEntries(locale: Locale): Promise<TeamFaqEntry[]>

  // --- Home -----------------------------------------------------------------
  getServerConcept(locale: Locale): Promise<ServerConceptDocument | null>
  getServerConnect(locale: Locale): Promise<ServerConnectDocument | null>
  getHomeCarousel(locale: Locale): Promise<HomeCarouselDocument | null>

  // --- Sponsoring -----------------------------------------------------------
  getSponsorsDocument(locale: Locale): Promise<SponsorsDocument | null>

  // --- Community POI --------------------------------------------------------
  /** All community POIs for a locale (unfiltered, unsorted — caller decides). */
  listCommunityPois(locale: Locale): Promise<CommunityPoi[]>
  /** Single POI by its `slug` frontmatter field, or null. */
  getCommunityPoiBySlug(locale: Locale, slug: string): Promise<CommunityPoi | null>
  /** Single POI in `locale` sharing the given `translationKey`, or null. */
  getCommunityPoiByTranslationKey(
    locale: Locale,
    translationKey: string
  ): Promise<CommunityPoi | null>
}
