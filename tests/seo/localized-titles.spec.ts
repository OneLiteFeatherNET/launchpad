import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * A German page whose title is the English one reads as untranslated in the
 * result list. Every i18n key that becomes a `<title>` must differ between
 * the locales, unless it is named here with the reason it may not.
 */
const TITLE_KEYS = [
  'index.title',
  'about.title',
  'join.title',
  'survival.title',
  'team.index.title',
  'blog.imprint.title',
  'blog.privacy.title',
  'blog.overview.page_title',
  'blog.author.title',
  'community_poi.overview.title',
  'projects.overview.title',
  'events.title',
  'bluemap.title',
  'community.title'
]

const SAME_IN_BOTH_LANGUAGES: Record<string, string> = {
  'bluemap.title': 'product name',
  'community.title': 'established loanword in German'
}

const messages = (locale: string) => JSON.parse(readFileSync(join(repoRoot, `i18n/locales/${locale}.json`), 'utf8')) as Record<string, unknown>

const lookup = (tree: Record<string, unknown>, key: string): string | undefined => key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], tree) as string | undefined

const de = messages('de')
const en = messages('en')

describe('page title keys', () => {
  it.each(TITLE_KEYS.filter(key => !(key in SAME_IN_BOTH_LANGUAGES)))('%s differs between German and English', (key) => {
    expect(lookup(de, key), `${key} missing in de.json`).toBeTruthy()
    expect(lookup(de, key)).not.toBe(lookup(en, key))
  })

  it.each(Object.keys(SAME_IN_BOTH_LANGUAGES))('%s exists in both languages', (key) => {
    expect(lookup(de, key), `${key} missing in de.json`).toBeTruthy()
    expect(lookup(en, key), `${key} missing in en.json`).toBeTruthy()
  })

  it.each(['de', 'en'])('names the blog overview "Blog" in %s', (locale) => {
    expect(lookup(locale === 'de' ? de : en, 'blog.overview.page_title')).toContain('Blog')
  })

  it('calls the German events overview "Veranstaltungen"', () => {
    expect(lookup(de, 'events.title')).toBe('Veranstaltungen')
  })
})

describe('DevBlog #1', () => {
  const seoTitle = (locale: string) => {
    const source = readFileSync(join(repoRoot, `content/blog/${locale}/dev-blog-1.md`), 'utf8')
    return /^seo:\n\s+title: '([^']+)'/m.exec(source)?.[1]
  }

  it('has its own seo.title in each language', () => {
    expect(seoTitle('de'), 'German seo.title').toBeTruthy()
    expect(seoTitle('en'), 'English seo.title').toBeTruthy()
  })

  it('does not share one title between the languages', () => {
    expect(seoTitle('de')).not.toBe(seoTitle('en'))
  })
})
