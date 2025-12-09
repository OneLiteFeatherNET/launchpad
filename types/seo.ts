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
  ogType?: string
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
