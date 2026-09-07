/**
 * Stable schema.org `@id` builders.
 *
 * The site uses URL-fragment identifiers so the same logical entity keeps
 * one ID across every page it shows up on. Keeping these builders in one
 * place means the URL format only changes in one file when site.url moves
 * or the fragment scheme evolves.
 */

const trimTrailingSlash = (url: string) => url.replace(/\/$/, '')

const sluggify = (input: string) =>
  encodeURIComponent(
    String(input).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  )

/** @id of the global OneLiteFeather Organization. Matches the identity that nuxt-schema-org emits. */
export const organizationId = (siteUrl: string): string =>
  `${trimTrailingSlash(siteUrl)}/#identity`

/** @id of a Person entity by team-member slug. Locale-independent. */
export const personId = (siteUrl: string, slug: string): string =>
  `${trimTrailingSlash(siteUrl)}/#/person/${slug}`

/** @id of a sponsor Organization entity. Slug derived from the sponsor name. */
export const sponsorId = (siteUrl: string, name: string): string =>
  `${trimTrailingSlash(siteUrl)}/#/sponsor/${sluggify(name)}`

/** Canonical team-profile URL for a given member slug. */
export const personProfileUrl = (siteUrl: string, locale: string, slug: string): string =>
  `${trimTrailingSlash(siteUrl)}/${locale}/team/${slug}`
