import type {
  SponsorsDeCollectionItem,
  SponsorsEnCollectionItem,
  BlogDeCollectionItem,
  BlogEnCollectionItem,
  TeamDeCollectionItem,
  TeamEnCollectionItem,
  ServerConceptDeCollectionItem,
  ServerConceptEnCollectionItem,
  ServerConnectDeCollectionItem,
  ServerConnectEnCollectionItem,
  HomeCarouselDeCollectionItem,
  HomeCarouselEnCollectionItem,
  CommunityPoiDeCollectionItem,
  CommunityPoiEnCollectionItem
} from '@nuxt/content'
import type { Locale } from './collections'
import type { FaqEntry, TeamFaqEntry } from '../../types-faq'

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
 * Shape of the `team` collection document, as @nuxt/content generates it.
 * Lives here rather than in the `team` layer: it is the return type of this
 * interface's `getTeamDocument`, and only content-core may name
 * `@nuxt/content` (enforced by module-boundaries.spec.ts). The `team` layer
 * imports this type from content-core's public API and derives its own
 * plain `TeamMember`/`TeamRank` shapes from it.
 */
export type TeamDocument = TeamDeCollectionItem | TeamEnCollectionItem

/**
 * Shape of the `server_concept` collection document, as @nuxt/content
 * generates it. Lives here rather than in the `home` layer: it is the return
 * type of this interface's `getServerConcept`, and only content-core may name
 * `@nuxt/content` (enforced by module-boundaries.spec.ts). The `home` layer
 * imports this type from content-core's public API and derives its own plain
 * `ServerConceptPoint` shape from it.
 */
export type ServerConceptDocument = ServerConceptDeCollectionItem | ServerConceptEnCollectionItem

/**
 * Shape of the `server_connect` collection document, as @nuxt/content
 * generates it. Lives here rather than in the `home` layer for the same
 * reason as {@link ServerConceptDocument}: only content-core may name
 * `@nuxt/content`.
 */
export type ServerConnectDocument = ServerConnectDeCollectionItem | ServerConnectEnCollectionItem

/**
 * Shape of the `home_carousel` collection document, as @nuxt/content
 * generates it. Lives here rather than in the `home` layer for the same
 * reason as {@link ServerConceptDocument}.
 */
export type HomeCarouselDocument = HomeCarouselDeCollectionItem | HomeCarouselEnCollectionItem

/**
 * Shape of the `community_poi` collection document, as @nuxt/content
 * generates it, widened with hand-written fields. Lives here rather than in
 * the `community-poi` layer: it is the return type of this interface's
 * community-POI methods, and only content-core may name `@nuxt/content`
 * (enforced by module-boundaries.spec.ts). The `community-poi` layer imports
 * this type from content-core's public API and derives the plain shapes its
 * composable and components actually work with, via indexed access (e.g.
 * `NonNullable<CommunityPoiDocument['gallery']>[number]`) rather than
 * duplicating named sub-interfaces here.
 */
export type CommunityPoiDocument = (
  | CommunityPoiDeCollectionItem
  | CommunityPoiEnCollectionItem
) & {
  slug: string
  translationKey?: string
  title: string
  summary: string
  status: 'planning' | 'in-progress' | 'paused' | 'completed'
  progress: number
  category?: 'team' | 'community' | 'collab' | 'farm'
  featured?: boolean
  featuredCaption?: string
  lore?: string
  goal?: string
  currentState?: string
  builders?: {
    name: string
    mcName?: string
    link?: string
  }[]
  location?: string
  coordinates?: {
    x: number
    y?: number
    z: number
    dimension?: 'overworld' | 'nether' | 'end'
  }
  thumbnail?: string
  thumbnailAlt?: string
  gallery?: {
    src: string
    alt: string
    caption?: string
    width?: number
    height?: number
  }[]
  schematics?: {
    url: string
    name: string
    format?: 'litematic' | 'schem' | 'schematic' | 'nbt'
    version?: string
    litematicaVersion?: string
    sizeLabel?: string
    origin?: {
      x: number
      y: number
      z: number
    }
    facing?: 'north' | 'south' | 'east' | 'west'
    rotation?: 'none' | 'cw_90' | 'cw_180' | 'cw_270' | 'ccw_90'
    setupNotes?: string
  }[]
  startedAt?: string | Date
  updatedAt?: string | Date
  forumUrl?: string
  acceptsContributions?: boolean
  canonical?: string
  alternates?: {
    hreflang: string
    href: string
  }[]
  head?: Record<string, unknown>
}

/**
 * Display order for `CommunityPoiDocument['status']` (in-progress first,
 * because that's where the community can still help; completed last). A
 * presentation ordering, not a CMS concept, but it lives beside the type it
 * orders rather than in either domain that consumes it: both `community-poi`
 * (its own overview page) and `home` (the featured-POI carousel) need the
 * identical ordering for this one schema enum, and duplicating it per domain
 * risks the two copies drifting — typed against `CommunityPoiDocument['status']`
 * itself so adding a status here is a compile error at every use site, not a
 * silent `?? 99` fallback in whichever copy someone forgot to update.
 */
export const COMMUNITY_POI_STATUS_ORDER: Record<CommunityPoiDocument['status'], number> = {
  'in-progress': 0,
  planning: 1,
  paused: 2,
  completed: 3
}

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
  listCommunityPois(locale: Locale): Promise<CommunityPoiDocument[]>
  /** Single POI by its `slug` frontmatter field, or null. */
  getCommunityPoiBySlug(locale: Locale, slug: string): Promise<CommunityPoiDocument | null>
  /** Single POI in `locale` sharing the given `translationKey`, or null. */
  getCommunityPoiByTranslationKey(
    locale: Locale,
    translationKey: string
  ): Promise<CommunityPoiDocument | null>
}
