import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const LOCALES = ['en', 'de'] as const

/** Retired and mistyped URLs that search engines still list, mapped to their current page. */
const SHARED_REDIRECTS: Array<[string, string]> = [
  ['/{l}/blog/about', '/{l}/about'],
  ['/{l}/blog/community-poi', '/{l}/community-poi'],
  ['/{l}/blog/author/phillipp-glanz', '/{l}/team/themeinerlp'],
  ['/{l}/community-poi/uncensored-library', '/{l}/community-poi'],
  ['/{l}/data-privacy', '/{l}/privacy']
]

const ENGLISH_ONLY_REDIRECTS: Array<[string, string]> = [['/en/blog/dev-blog-1', '/en/blog/dev-blog-1-what-we-using'], ['/en/blog/otis-regular-data-minecraft', '/en/blog/otis-central-player-data-minecraft']]

const pairs: Array<[string, string]> = [
  ...LOCALES.flatMap(l => SHARED_REDIRECTS.map(([from, to]): [string, string] => [from.replace('{l}', l), to.replace('{l}', l)])),
  ...ENGLISH_ONLY_REDIRECTS,
  ['/data-privacy', '/en/privacy']
]

describe('legacy redirect route rules', () => {
  const config = readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')

  it.each(pairs)('redirects %s to %s permanently', (from, to) => {
    expect(config).toContain(`'${from}': { redirect: { to: '${to}', statusCode: 301 } }`)
  })
})
