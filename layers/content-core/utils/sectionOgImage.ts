/**
 * The fixed social card of each section page, one per locale. The PNGs are
 * rendered by scripts/render-og-images.mjs and uploaded to the image bucket
 * under images/og/, so the path resolves through the image provider like any
 * other page image. Keep the list in step with the script's SECTIONS.
 */
export const OG_SECTIONS = [
  'home',
  'blog',
  'projects',
  'community',
  'community-poi',
  'events',
  'team',
  'about',
  'bluemap'
] as const

export type OgSection = typeof OG_SECTIONS[number]

export function sectionOgImage(section: OgSection, locale: string): string {
  return `/images/og/${section}-${locale}.png`
}
