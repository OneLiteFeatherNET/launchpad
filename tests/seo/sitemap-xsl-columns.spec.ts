import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `xslColumns` decides what the human-readable sitemap view shows. Each entry's
 * `select` is dropped verbatim into `<xsl:value-of select="…"/>` inside a
 * `for-each` over `sitemap:urlset/sitemap:url`, so an XPath that matches
 * nothing produces an empty column rather than an error — the failure looks
 * like missing data, which is the worst thing it could look like on a page
 * whose whole job is to show you your sitemap.
 *
 * The `Language` column selected `sitemap:hreflang`. Measured on a rendered
 * child sitemap:
 *
 *   <url> elements               29
 *   <sitemap:hreflang> elements   0
 *   <xhtml:link hreflang="…">    67
 *
 * There is no `hreflang` element in the sitemap namespace. Alternates are an
 * *attribute* on `<xhtml:link>`, and that namespace is already declared in the
 * stylesheet, so `xhtml:link/@hreflang` is what reaches them.
 *
 * The check is written against the element and attribute names a sitemap
 * actually contains, so a column pointing at an invented node fails here
 * rather than rendering blank in production.
 */

const CONFIG = 'nuxt.config.ts'

/** Nodes a urlset entry can offer. `loc` and `lastmod` are sitemap children. */
const SITEMAP_CHILDREN = ['loc',
  'lastmod',
  'changefreq',
  'priority']
/** Alternates live on xhtml:link, as attributes. */
const XHTML_ATTRIBUTES = ['hreflang',
  'href',
  'rel']

/**
 * Every column, including the ones without a `select`.
 *
 * The URL column has none — the module renders it itself and filters it out
 * before emitting `xsl:value-of` at all. Requiring `select:` in the pattern
 * silently dropped it, which is how the first version of this file ended up
 * parsing two columns out of three.
 */
function columns(): Array<{ label: string, select: string }> {
  const source = readFileSync(`${repoRoot}/${CONFIG}`, 'utf8')
  const block = /xslColumns:\s*\[([\s\S]*?)\n\s*\]/.exec(source)
  if (!block) return []
  return [...block[1]!.matchAll(/\{\s*label:\s*'([^']+)'([^}]*)\}/g)]
    .map(([, label,
rest]) => ({
      label: label!,
      select: /select:\s*'([^']*)'/.exec(rest!)?.[1] ?? ''
    }))
}

/** Can this XPath name a node a sitemap entry actually has? */
function resolvable(select: string): boolean {
  if (!select) return true // the URL column is rendered by the module itself
  const sitemapChild = /^sitemap:(\w+)$/.exec(select)
  if (sitemapChild) return SITEMAP_CHILDREN.includes(sitemapChild[1]!)
  const xhtmlAttribute = /^xhtml:link\/@(\w+)$/.exec(select)
  if (xhtmlAttribute) return XHTML_ATTRIBUTES.includes(xhtmlAttribute[1]!)
  return false
}

describe('sitemap xsl columns', () => {
  it('reads the column definitions', () => {
    // Without this, an unparsed config would pass the rule below.
    const all = columns()
    expect(all.length).toBeGreaterThan(2)
    expect(all.map((c) => c.label)).toContain('Language')

    // The resolver has to tell a real node from an invented one.
    expect(resolvable('sitemap:lastmod')).toBe(true)
    expect(resolvable('sitemap:hreflang')).toBe(false)
    expect(resolvable('xhtml:link/@hreflang')).toBe(true)
    expect(resolvable('xhtml:link/@nonsense')).toBe(false)
  })

  it('every column selects something a sitemap entry has', () => {
    const unresolvable = columns()
      .filter((c) => !resolvable(c.select))
      .map((c) => `${c.label}: ${c.select}`)
    expect(unresolvable).toEqual([])
  })
})
