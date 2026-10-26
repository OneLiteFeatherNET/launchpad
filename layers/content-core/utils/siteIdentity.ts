import { organizationId, siteRootUrl, websiteId } from './schema-ids'

/** A value, or a getter that nuxt-schema-org resolves when the page is rendered. */
type Lazy<T> = T | (() => T)

export interface RootWebSiteInput {
  siteUrl: string
  name: Lazy<string>
  description: Lazy<string>
  /** BCP 47 tags of every language the site is published in. */
  languages: string[]
}

// Google reads these as the alternative names of the site; the domain in lower
// case is one it explicitly accepts.
const ALTERNATE_NAMES = [
  'OneLiteFeather Network',
  'onelitefeather.net',
  'OLF'
]

/**
 * The domain's single WebSite. Google supports site names for the domain root
 * only, so `url` is the root whatever locale the page is in.
 */
export function rootWebSiteNode({ siteUrl, name, description, languages }: RootWebSiteInput) {
  return {
    '@id': websiteId(siteUrl),
    'url': siteRootUrl(siteUrl),
    name,
    'alternateName': ALTERNATE_NAMES,
    'inLanguage': languages,
    description,
    'publisher': { '@id': organizationId(siteUrl) }
  }
}

/** Merges the page language's description into the organization configured in nuxt.config. */
export function organizationDescriptionNode(siteUrl: string, description: Lazy<string>) {
  return { '@id': organizationId(siteUrl), description }
}
