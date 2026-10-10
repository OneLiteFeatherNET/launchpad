import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'
import { locales } from '../../layers/content-core/utils/content/locales'

/**
 * An internal markdown link in content/ must name a page that exists for the
 * link's own locale. Nothing in the build checks this: a link to a slug that
 * was renamed or never published renders fine and only 404s for the reader.
 *
 * Static routes come from `pages/`. Dynamic segments come from the slugs the
 * app itself queries. A new dynamic route fails until it gets a slug source
 * here, so the check cannot quietly stop covering it.
 */

type Frontmatter = Record<string, unknown>

export interface Link { file: string, locale: string | undefined, href: string }

export interface Target { locale: string | undefined, path: string }

export interface RouteTable {
  staticPaths: Set<string>
  /** Prefix such as `blog` or `blog/author` -> locale -> slugs. */
  dynamic: Map<string, Map<string, Set<string>>>
}

const SITE = 'https://onelitefeather.net'
const ASSET_PREFIX = '/images/'

function localeOf(file: string): string | undefined {
  const segment = file.split('/')[2]
  return segment && (locales as readonly string[]).includes(segment) ? segment : undefined
}

/** Markdown links in the body, images and frontmatter excluded. */
export function markdownLinks(file: string, text: string): Link[] {
  const body = text.startsWith('---') ? text.slice(text.indexOf('\n---', 3) + 4) : text
  const locale = localeOf(file)
  return [...body.matchAll(/(!?)\[[^\]\n]*\]\(([^)\s]+)\)/g)]
    .filter(([, bang]) => bang === '')
    .map(([, , href]) => ({ file, locale, href: href! }))
}

/** The locale and page path a link points to, or undefined for anything outside the site. */
export function internalTarget(href: string): Target | undefined {
  let rest: string
  if (href.startsWith(SITE)) rest = href.slice(SITE.length)
  else if (href.startsWith('/') && !href.startsWith('//')) rest = href
  else return undefined
  rest = rest.split(/[?#]/)[0]!
  if (rest.startsWith(ASSET_PREFIX)) return undefined
  const segments = rest.split('/').filter(Boolean)
  const [first, ...others] = segments
  if (first !== undefined && (locales as readonly string[]).includes(first)) {
    return { locale: first, path: others.join('/') }
  }
  return { locale: undefined, path: segments.join('/') }
}

export function pageExists(routes: RouteTable, locale: string, path: string): boolean {
  if (routes.staticPaths.has(path)) return true
  for (const [prefix, byLocale] of routes.dynamic) {
    if (!path.startsWith(`${prefix}/`)) continue
    const slug = path.slice(prefix.length + 1)
    if (!slug.includes('/') && byLocale.get(locale)?.has(slug)) return true
  }
  return false
}

export function unresolvedLinks(links: Link[], routes: RouteTable): string[] {
  return links.flatMap((link) => {
    const target = internalTarget(link.href)
    if (!target) return []
    if (target.locale === undefined) {
      return [`${link.file}: ${link.href} has no locale prefix`]
    }
    if (link.locale !== undefined && target.locale !== link.locale) {
      return [`${link.file}: ${link.href} links to ${target.locale} from a ${link.locale} file`]
    }
    if (!pageExists(routes, target.locale, target.path)) {
      return [`${link.file}: ${link.href} does not resolve in ${target.locale}`]
    }
    return []
  })
}

function vueFiles(dir: string, prefix = ''): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return vueFiles(full, `${prefix}${entry}/`)
    return entry.endsWith('.vue') ? [`${prefix}${entry}`] : []
  })
}

function frontmatters(collection: string): Array<{ locale: string, data: Frontmatter }> {
  return collectSourceFiles([`content/${collection}`], ['.md']).flatMap((file) => {
    const locale = localeOf(relativeToRepo(file))
    if (!locale) return []
    const text = readFileSync(file, 'utf8')
    const data = (parse(text.slice(3, text.indexOf('\n---', 3))) ?? {}) as Frontmatter
    return [{ locale, data }]
  })
}

function fieldOf(collection: string, field: string): (locale: string) => Set<string> {
  return (locale) => new Set(frontmatters(collection)
    .filter((doc) => doc.locale === locale && typeof doc.data[field] === 'string')
    .map((doc) => doc.data[field] as string))
}

function teamSlugs(locale: string): Set<string> {
  const slugs = new Set<string>()
  for (const file of collectSourceFiles(['content/team'], ['.json'])) {
    if (localeOf(relativeToRepo(file)) !== locale) continue
    const json = JSON.parse(readFileSync(file, 'utf8')) as { members?: Array<{ slug?: string }> }
    for (const member of json.members ?? []) if (member.slug) slugs.add(member.slug)
  }
  return slugs
}

/** The slug each dynamic page directory is routed by, keyed by its directory under `pages/`. */
const SLUG_SOURCES: Record<string, (locale: string) => Set<string>> = {
  'blog': fieldOf('blog', 'slug'),
  'blog/author': fieldOf('blog', 'author'),
  'projects': fieldOf('projects', 'slug'),
  'community-poi': fieldOf('community-poi', 'slug'),
  'events': fieldOf('events', 'slug'),
  'team': teamSlugs,
}

export function buildRouteTable(vuePages: string[]): RouteTable {
  const staticPaths = new Set<string>()
  const dynamic = new Map<string, Map<string, Set<string>>>()
  for (const page of vuePages) {
    const route = page.replace(/\.vue$/, '').replace(/(^|\/)index$/, '')
    if (!route.includes('[')) {
      staticPaths.add(route)
      continue
    }
    const prefix = route.slice(0, route.indexOf('[')).replace(/\/$/, '')
    const source = SLUG_SOURCES[prefix]
    if (!source) throw new Error(`pages/${page} has no slug source in tests/content/internal-links.spec.ts`)
    dynamic.set(prefix, new Map(locales.map((locale) => [locale, source(locale)])))
  }
  return { staticPaths, dynamic }
}

describe('internal link targets', () => {
  const bySlugs = (de: string[], en: string[]) => new Map([['de', new Set(de)], ['en', new Set(en)]])
  const routes: RouteTable = {
    staticPaths: new Set(['', 'bluemap']),
    dynamic: new Map([
      ['blog', bySlugs(['post-de'], ['post-en'])], ['blog/author', bySlugs(['ada'], ['ada'])],
    ]),
  }
  const linksIn = (file: string, text: string) => unresolvedLinks(markdownLinks(file, text), routes)

  it('accepts a link to a post that exists in the locale of its file', () => {
    expect(linksIn('content/blog/de/a.md', '[x](/de/blog/post-de)')).toEqual([])
  })

  it('names the file and href when the slug exists only in the other locale', () => {
    expect(linksIn('content/blog/de/a.md', '[x](/de/blog/post-en)'))
      .toEqual(['content/blog/de/a.md: /de/blog/post-en does not resolve in de'])
  })

  it('flags a link into the other locale even when the target exists', () => {
    expect(linksIn('content/blog/de/a.md', '[x](/en/blog/post-en)'))
      .toEqual(['content/blog/de/a.md: /en/blog/post-en links to en from a de file'])
  })

  it('accepts the absolute onelitefeather.net form used by the cluster posts', () => {
    expect(linksIn('content/blog/de/a.md', '[x](https://onelitefeather.net/de/blog/post-de)')).toEqual([])
  })

  it('resolves static pages and author pages', () => {
    expect(linksIn('content/faq/en/b.md', '[x](/en/bluemap) [y](/en/blog/author/ada)')).toEqual([])
  })

  it('ignores images, external links and in-page anchors', () => {
    expect(linksIn('content/blog/de/a.md', '![a](/images/x.png) [y](https://example.com/de/blog/nope) [z](#top)')).toEqual([])
  })

  it('compares the path without its query string or fragment', () => {
    expect(linksIn('content/blog/de/a.md', '[x](/de/blog/post-de#intro)')).toEqual([])
  })

  it('flags a root-relative link without a locale prefix', () => {
    expect(linksIn('content/blog/de/a.md', '[x](/blog/post-de)'))
      .toEqual(['content/blog/de/a.md: /blog/post-de has no locale prefix'])
  })

  it('reads only the body, not the frontmatter', () => {
    const text = '---\ncanonical: \'https://onelitefeather.net/de/blog/missing\'\n---\nNo links here.'
    expect(markdownLinks('content/blog/de/a.md', text)).toEqual([])
  })

  it('names a page that does not exist', () => {
    expect(linksIn('content/blog/en/a.md', '[x](/en/blog/missing)'))
      .toEqual(['content/blog/en/a.md: /en/blog/missing does not resolve in en'])
  })
})

describe('internal links in the content files', () => {
  const routes = buildRouteTable(vueFiles(join(repoRoot, 'pages')))
  const links = collectSourceFiles(['content'], ['.md'])
    .flatMap((file) => markdownLinks(relativeToRepo(file), readFileSync(file, 'utf8')))

  it('reads the routes and the links it checks', () => {
    expect(routes.staticPaths.has('bluemap')).toBe(true)
    expect(routes.dynamic.has('blog')).toBe(true)
    expect(links.length).toBeGreaterThan(5)
  })

  it('resolves every internal link to a page of its own locale', () => {
    expect(unresolvedLinks(links, routes)).toEqual([])
  })
})
