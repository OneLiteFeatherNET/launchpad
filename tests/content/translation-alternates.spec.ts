import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Translated articles and builds have different slugs per language
 * (`/en/blog/when-a-server-fails-…` ↔ `/de/blog/wenn-ein-server-ausfaellt-…`),
 * so neither @nuxtjs/i18n nor @nuxtjs/sitemap can pair them by path. The
 * pairing lives in each document's front-matter `alternates`, and both the
 * page's hreflang links and its sitemap entry are built from it.
 *
 * Google ignores an hreflang annotation that is not confirmed from the other
 * side, so a one-way link is worth nothing. This suite holds the pairing
 * symmetric: every alternate must point at a document that exists and that
 * points back.
 */

const SITE = 'https://onelitefeather.net'
const COLLECTIONS = [
  { dir: 'content/blog', route: 'blog' }, { dir: 'content/community-poi', route: 'community-poi' },
]

type Alternate = { hreflang: string, href: string }
type Doc = { file: string, url: string, alternates: Alternate[] }

function frontmatter(file: string): Record<string, unknown> {
  const text = readFileSync(file, 'utf8')
  const end = text.indexOf('\n---', 3)
  return parse(text.slice(3, end)) as Record<string, unknown>
}

const docs: Doc[] = COLLECTIONS.flatMap(({ dir, route }) => collectSourceFiles([dir], ['.md']).map((file) => {
    const locale = relativeToRepo(file).split('/')[2]
    const data = frontmatter(file)
    return {
      file: relativeToRepo(file),
      url: `${SITE}/${locale}/${route}/${data.slug}`,
      alternates: (data.alternates as Alternate[] | undefined) ?? [],
    }
  }))

const byUrl = new Map(docs.map(doc => [doc.url, doc]))

describe('translation alternates', () => {
  it('finds the documents', () => {
    expect(docs.length).toBeGreaterThan(10)
  })

  it.each(docs.map(doc => [doc.file, doc] as const))('%s names itself', (_, doc) => {
    const locale = doc.url.slice(SITE.length + 1, SITE.length + 3)
    expect(doc.alternates).toContainEqual({ hreflang: locale, href: doc.url })
  })

  // x-default marks the fallback of a language cluster. A document that
  // exists in one language has no cluster, and @nuxtjs/i18n emits no
  // x-default for it either — the sitemap and the page have to agree.
  it.each(docs.map(doc => [doc.file, doc] as const))('%s has x-default exactly when translated', (_, doc) => {
    const translated = doc.alternates.some(alt => alt.hreflang !== 'x-default' && alt.href !== doc.url)
    expect(doc.alternates.some(alt => alt.hreflang === 'x-default')).toBe(translated)
  })

  it.each(docs.map(doc => [doc.file, doc] as const))('%s is confirmed from the other side', (_, doc) => {
    const broken: string[] = []
    for (const alt of doc.alternates) {
      if (alt.hreflang === 'x-default' || alt.href === doc.url) continue
      const target = byUrl.get(alt.href)
      if (!target) {
        broken.push(`${alt.hreflang}: ${alt.href} does not exist`)
        continue
      }
      if (!target.alternates.some(back => back.href === doc.url)) {
        broken.push(`${alt.hreflang}: ${target.file} does not link back`)
      }
    }
    expect(broken).toEqual([])
  })
})
