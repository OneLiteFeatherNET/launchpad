import type { Locale } from './collections'
import type { BlogArticle, BlogAuthorProfile } from '~/types/blog'
import type { FaqEntry, TeamFaqEntry } from '~/types/faq'
import type { TeamDocument } from '~/types/team'
import type {
  ServerConceptDocument,
  ServerConnectDocument,
  HomeCarouselDocument
} from '~/types/home'
import type { SponsorsDocument } from '~/types/sponsoring'
import type { CommunityPoi } from '~/types/community-poi'

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
