import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The sitemap `filter` and `onUrl` functions in content.config.ts are not
 * called where they are written. @nuxtjs/sitemap serialises them with
 * `fn.toString()` into a Nitro virtual module and runs them there, per
 * sitemap request, in a scope that holds nothing from content.config.ts.
 *
 * So they are tested the same way: extracted as source, stripped of types
 * and evaluated in an empty scope. A function that closes over an import or
 * a module-level constant fails here exactly as it would in production.
 */

const source = readFileSync(`${repoRoot}/content.config.ts`, 'utf8')

/** The arrow function assigned to `key` inside the sitemap block for `name`. */
function extract(name: string, key: 'filter' | 'onUrl'): string {
  const block = source.indexOf(`name: \`${name}_\${locale}\``)
  expect(block, `no sitemap block for ${name}`).toBeGreaterThan(0)
  const start = source.indexOf(`${key}: (`, block)
  expect(start, `no ${key} in ${name}`).toBeGreaterThan(0)
  const body = source.indexOf('{', source.indexOf('=>', start))
  let depth = 0
  for (let i = body; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}' && --depth === 0) return source.slice(start + key.length + 2, i + 1)
  }
  throw new Error(`unbalanced ${key} in ${name}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compile<T extends (...args: any[]) => unknown>(name: string, key: 'filter' | 'onUrl'): T {
  const js = ts.transpileModule(`export default ${extract(name, key)}`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
  const module = { exports: {} as { default: T } }
  // Only `module` and `exports` in scope, like the module's virtual file.
  new Function('module', 'exports', js)(module, module.exports)
  return module.exports.default
}

type Url = Record<string, unknown>

const blogFilter = compile<(entry: Record<string, unknown>) => boolean>('blog', 'filter')
const blogOnUrl = compile<(url: Url, entry: Record<string, unknown>, collection: string) => void>('blog', 'onUrl')
const poiOnUrl = compile<(url: Url, entry: Record<string, unknown>, collection: string) => void>('community_poi', 'onUrl')

const day = 24 * 60 * 60 * 1000
const alternates = [
  { hreflang: 'de', href: 'https://onelitefeather.net/de/blog/artikel' },
  { hreflang: 'en', href: 'https://onelitefeather.net/en/blog/article' },
  { hreflang: 'x-default', href: 'https://onelitefeather.net/en/blog/article' },
]

describe('blog sitemap filter', () => {
  it('drops an article whose release date is in the future', () => {
    expect(blogFilter({ pubDate: '2026-01-01', releaseDate: new Date(Date.now() + day).toISOString() })).toBe(false)
  })

  it('keeps an article once its release date has passed', () => {
    expect(blogFilter({ pubDate: '2026-01-01', releaseDate: new Date(Date.now() - day).toISOString() })).toBe(true)
  })

  it('falls back to pubDate when there is no release date', () => {
    expect(blogFilter({ pubDate: new Date(Date.now() + day).toISOString() })).toBe(false)
    expect(blogFilter({ pubDate: '2026-03-01' })).toBe(true)
  })
})

describe('blog sitemap entries', () => {
  it('uses updatedDate as lastmod when present', () => {
    const url: Url = { loc: '' }
    blogOnUrl(url, { slug: 'article', pubDate: '2026-03-01', updatedDate: '2026-04-10' }, 'blog_en')
    expect((url.lastmod as Date).toISOString().slice(0, 10)).toBe('2026-04-10')
  })

  it('falls back to pubDate as lastmod', () => {
    const url: Url = { loc: '' }
    blogOnUrl(url, { slug: 'article', pubDate: '2026-03-01' }, 'blog_en')
    expect((url.lastmod as Date).toISOString().slice(0, 10)).toBe('2026-03-01')
  })

  it('builds the route and pairs the translation with region tags', () => {
    const url: Url = { loc: '/blog/en/article' }
    blogOnUrl(url, { slug: 'article', pubDate: '2026-03-01', alternates }, 'blog_en')
    expect(url.loc).toBe('/en/blog/article')
    expect(url.alternatives).toEqual([
      { hreflang: 'de-DE', href: 'https://onelitefeather.net/de/blog/artikel' },
      { hreflang: 'en-US', href: 'https://onelitefeather.net/en/blog/article' },
      { hreflang: 'x-default', href: 'https://onelitefeather.net/en/blog/article' },
    ])
  })

  it('drops changefreq and priority carried in front matter', () => {
    const url: Url = { loc: '', changefreq: 'monthly', priority: 0.8, lastmod: '2024-01-01' }
    blogOnUrl(url, { slug: 'artikel', pubDate: '2024-09-29' }, 'blog_de')
    expect(url).not.toHaveProperty('changefreq')
    expect(url).not.toHaveProperty('priority')
    expect((url.lastmod as Date).toISOString().slice(0, 10)).toBe('2024-09-29')
  })
})

describe('community POI sitemap entries', () => {
  it('pairs harbour-building with hafengebaeude and dates it', () => {
    const url: Url = { loc: '' }
    poiOnUrl(url, {
      slug: 'hafengebaeude',
      startedAt: '2026-05-01',
      updatedAt: '2026-09-07',
      alternates: [
        { hreflang: 'de', href: 'https://onelitefeather.net/de/community-poi/hafengebaeude' },
        { hreflang: 'en', href: 'https://onelitefeather.net/en/community-poi/harbour-building' },
        { hreflang: 'x-default', href: 'https://onelitefeather.net/en/community-poi/harbour-building' },
      ],
    }, 'community_poi_de')
    expect(url.loc).toBe('/de/community-poi/hafengebaeude')
    expect((url.lastmod as Date).toISOString().slice(0, 10)).toBe('2026-09-07')
    expect(url.alternatives).toContainEqual({ hreflang: 'en-US', href: 'https://onelitefeather.net/en/community-poi/harbour-building' })
  })

  it('carries no lastmod without a content date', () => {
    const url: Url = { loc: '' }
    poiOnUrl(url, { slug: 'x' }, 'community_poi_en')
    expect(url).not.toHaveProperty('lastmod')
  })
})
