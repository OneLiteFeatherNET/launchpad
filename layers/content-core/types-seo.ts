export type PageSeoOptions = {
  /**
   * Page title used for <title>, OG and Twitter cards.
   * Falls back to site.name when omitted.
   */
  title?: string
  /**
   * Meta description used for <meta name="description"> and social cards.
   * Falls back to site description or a generic default.
   */
  description?: string
  /**
   * Keywords meta. Accepts an array or a comma separated string.
   */
  keywords?: string | string[]
  /**
   * Path or URL to the preview image. Will be processed via @nuxt/image.
   */
  image?: string
  /**
   * Alt text for the social preview image.
   */
  imageAlt?: string
  /** Optional explicit preview image dimensions for og:image:width/height. */
  imageWidth?: number
  imageHeight?: number
  /**
   * Explicit canonical URL. If omitted, the current route path is resolved against site.url.
   */
  canonical?: string
  /**
   * OpenGraph type, default "website".
   */
  ogType?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_status' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
  /**
   * Twitter card type, default "summary_large_image".
   */
  twitterCard?: 'summary' | 'summary_large_image'
  /**
   * Twitter @handle that owns the site (e.g. "@onelitefeather").
   */
  twitterSite?: string
  /**
   * Twitter @handle of the content creator. Overrides `twitterSite` for author attribution.
   */
  twitterCreator?: string
  /**
   * Schema.org type of the page itself, default "WebPage". Limited to
   * WebPage and its subtypes: it refines the one WebPage node every page
   * carries. What the page is *about* — the site, an article, a build — is a
   * separate node the page defines itself.
   */
  schemaType?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage' | 'FAQPage' | 'ItemPage' | 'ProfilePage' | 'SearchResultsPage'
  /**
   * Optional robots directive to override defaults. Wins over noindex/nofollow flags.
   */
  robots?: string
  /** Convenience flag: emit `noindex` in the robots directive. */
  noindex?: boolean
  /** Convenience flag: emit `nofollow` in the robots directive. */
  nofollow?: boolean
}
