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
   * Path or URL to the preview image. Will be processed via @nuxt/image.
   */
  image?: string
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
   * Schema.org type, default "WebPage".
   */
  schemaType?: string
  /**
   * Optional robots directive to override defaults.
   */
  robots?: string
}
