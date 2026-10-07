import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const home = readFileSync(`${repoRoot}/pages/index.vue`, 'utf8')
const template = home.slice(home.indexOf('<template>'))

const at = (needle: string) => {
  const index = template.indexOf(needle)
  expect(index, `${needle} is in the home template`).toBeGreaterThan(-1)
  return index
}

describe('home page order', () => {
  it('puts Discord right under the carousel, ahead of the server addresses', () => {
    expect(at('<LazyDiscordCta')).toBeGreaterThan(at('<Carousel'))
    expect(at('<LazyServerAddresses')).toBeGreaterThan(at('<LazyDiscordCta'))
  })

  it('follows with the numbers strip and then the concept', () => {
    expect(at('<LazyCommunityStrip')).toBeGreaterThan(at('<LazyServerAddresses'))
    expect(at('<LazyServerConcept')).toBeGreaterThan(at('<LazyCommunityStrip'))
  })

  it('hydrates the Discord block on visibility, from props the page prepared', () => {
    expect(home).toMatch(/<LazyDiscordCta[^>]*hydrate-on-visible/)
    expect(home).toMatch(/<LazyDiscordCta[^>]*:members="numbers\.discordMembers"/)
    expect(home).toMatch(/<LazyDiscordCta[^>]*:href="discordUrl"/)
    expect(home).toContain('useRuntimeConfig().public.discordUrl')
  })

  it('keeps exactly one h1', () => {
    expect(template.match(/<h1[\s>]/g)).toHaveLength(1)
  })
})
