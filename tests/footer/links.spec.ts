// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SiteFooter from '../../layers/footer/components/SiteFooter.vue'

const open = async (route: string) => {
  const wrapper = await mountSuspended(SiteFooter, { route })
  return wrapper.findAll('a')
}

describe('SiteFooter links', () => {
  it('has no aria-disabled link', async () => {
    const links = await open('/de')
    expect(links.filter((a) => a.attributes('aria-disabled') !== undefined)).toHaveLength(0)
  })

  it('gives every link a real href', async () => {
    const links = await open('/de')
    for (const a of links) {
      const href = a.attributes('href')
      expect(href, `link "${a.text()}"`).toBeTruthy()
      expect(href).not.toBe('#')
    }
  })

  it('opens external links in a new tab without leaking the opener', async () => {
    const links = await open('/de')
    const external = links.filter((a) => /^https?:/.test(a.attributes('href') ?? ''))
    expect(external.length).toBeGreaterThanOrEqual(8)
    for (const a of external) {
      expect(a.attributes('target'), a.attributes('href')).toBe('_blank')
      expect(a.attributes('rel'), a.attributes('href')).toContain('noopener')
      expect(a.attributes('rel'), a.attributes('href')).toContain('noreferrer')
    }
  })

  it('links GitHub, contact and about to their targets', async () => {
    const hrefs = (await open('/de')).map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://github.com/OneLiteFeatherNET')
    expect(hrefs).toContain('https://1lf.link/discord')
    expect(hrefs).toContain('/de/about')
  })

  it('localises the about link', async () => {
    const hrefs = (await open('/en')).map((a) => a.attributes('href'))
    expect(hrefs).toContain('/en/about')
  })
})
