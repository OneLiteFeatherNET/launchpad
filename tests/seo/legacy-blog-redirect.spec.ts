import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/** Blog links without a locale prefix move permanently to the English blog. */
const config = readFileSync(`${repoRoot}/nuxt.config.ts`, 'utf8')
const ruleLine = (source: string) => config.split('\n').find(line => line.trim().startsWith(`'${source}':`)) ?? ''

describe('legacy blog redirect', () => {
  it.each([
    ['/blog', '/en/blog'], ['/blog/**', '/en/blog/**']
  ])('redirects %s to %s with 301', (source, target) => {
    const line = ruleLine(source)
    expect(line, `no routeRule for ${source}`).not.toBe('')
    expect(line).toContain(`redirect: { to: '${target}', statusCode: 301 }`)
  })

  it.each(['/blog', '/blog/**'])('puts no edge cache directive on %s', (source) => {
    expect(ruleLine(source)).not.toContain('cloudflare-cdn-cache-control')
  })

  it('leaves the root path on its no-store rule', () => {
    expect(ruleLine('/')).toContain('no-store')
  })
})
