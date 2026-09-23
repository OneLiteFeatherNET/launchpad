/**
 * The image every indexable page falls back to for og:image / twitter:image.
 * 1200×630, the size Open Graph and `summary_large_image` cards expect.
 *
 * Served straight from public/, not through @nuxt/image: in production the
 * image provider points at img.onelitefeather.net, whose origin is not this
 * repository's public/ directory, so a transformed URL for this file would
 * 404.
 */
export const DEFAULT_SOCIAL_IMAGE = {
  path: '/images/og-default.png',
  width: 1200,
  height: 630
} as const

export type SocialImage = {
  url: string
  width: number
  height: number
}

/**
 * Resolves the social preview image for a page: the page's own image,
 * transformed to 1200×630 WebP, or the site default. Always absolute —
 * crawlers resolve a relative og:image against nothing, and with the `none`
 * image provider the transform returns the path unchanged.
 */
export function resolveSocialImage(
  image: string | undefined,
  siteUrl: string,
  transform: (src: string) => string
): SocialImage {
  if (!image) {
    return {
      url: new URL(DEFAULT_SOCIAL_IMAGE.path, siteUrl).toString(),
      width: DEFAULT_SOCIAL_IMAGE.width,
      height: DEFAULT_SOCIAL_IMAGE.height
    }
  }
  return {
    url: new URL(transform(image), siteUrl).toString(),
    width: 1200,
    height: 630
  }
}
