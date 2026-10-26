import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * The brand query "onelitefeather" ranks on the home page only if the title
 * leads with the brand and every site-name field says the same thing.
 */

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')
const homeTitle = (locale: string): string => {
  const messages = JSON.parse(read(`i18n/locales/${locale}.json`)) as { index: { title: string } }
  return messages.index.title
}

describe('home title', () => {
  it('leads with the brand in German', () => {
    expect(homeTitle('de')).toMatch(/^OneLiteFeather /)
  })

  it('leads with the brand in English', () => {
    expect(homeTitle('en')).toMatch(/^OneLiteFeather /)
  })

  it('carries no global " | " suffix in its own text', () => {
    expect(homeTitle('de')).not.toContain(' | ')
    expect(homeTitle('en')).not.toContain(' | ')
  })

  it('opts the home page out of the app-wide title template', () => {
    expect(read('layers/home/composables/useHomeSeo.ts')).toContain("useHead({ titleTemplate: '%s' })")
  })
})

describe('site name', () => {
  it('suffixes page titles with OneLiteFeather', () => {
    expect(read('app.vue')).toContain('`${titleChunk} | OneLiteFeather`')
  })

  it('sets the site name to OneLiteFeather', () => {
    expect(read('nuxt.config.ts')).toMatch(/site:\s*\{[^}]*\bname: 'OneLiteFeather',/)
  })

  it('uses OneLiteFeather as the Organization name in both environments', () => {
    const config = read('nuxt.config.ts')
    expect(config).toMatch(/defineOrganization\(\{\s*name: 'OneLiteFeather',\s*alternateName: /)
    expect(config).toMatch(/name: 'OneLiteFeather',\s*url: 'https:\/\/onelitefeather\.net'/)
  })

  it('keeps the former name "OneLiteFeather Network" as the alternate name only', () => {
    expect(read('nuxt.config.ts')).toContain("alternateName: 'OneLiteFeather Network'")
  })

  it('names the web app manifest OneLiteFeather', () => {
    expect((JSON.parse(read('public/site.webmanifest')) as { name: string }).name).toBe('OneLiteFeather')
  })
})

type Messages = { nuxtSiteConfig: { description: string }, index: { description: string } }
const messages = (locale: string) => JSON.parse(read(`i18n/locales/${locale}.json`)) as Messages

describe('organization', () => {
  it('describes the organization with the English site description in nuxt.config', () => {
    const descriptions = [...read('nuxt.config.ts').matchAll(/^\s*description: '([^']+)'/gm)].map(match => match[1])
    expect(descriptions.length, 'identity and site description').toBeGreaterThanOrEqual(2)
    for (const description of descriptions) expect(description).toBe(messages('en').nuxtSiteConfig.description)
  })

  it('points the logo at a PNG in both environments', () => {
    const logos = [...read('nuxt.config.ts').matchAll(/\blogo: '([^']+)'/g)].map(match => match[1])
    expect(logos).toEqual(['/images/logo.png', 'https://onelitefeather.net/images/logo.png'])
  })

  it('ships a logo.png of at least 112 x 112 pixels', () => {
    const png = readFileSync(`${repoRoot}/public/images/logo.png`)
    expect(png.subarray(1, 4).toString('latin1'), 'PNG signature').toBe('PNG')
    expect(png.readUInt32BE(16), 'width').toBeGreaterThanOrEqual(112)
    expect(png.readUInt32BE(20), 'height').toBeGreaterThanOrEqual(112)
  })
})

describe('home description', () => {
  it.each(['de', 'en'])('begins with the brand in %s', (locale) => {
    expect(messages(locale).index.description).toMatch(/^OneLiteFeather\b/)
  })

  it.each(['de', 'en'])('names the domain in %s', (locale) => {
    expect(messages(locale).index.description).toContain('onelitefeather.net')
  })

  it.each(['de', 'en'])('has a snippet length in %s', (locale) => {
    const { length } = messages(locale).index.description
    expect(length).toBeGreaterThanOrEqual(50)
    expect(length).toBeLessThanOrEqual(200)
  })

  it('is what the home page sets', () => {
    expect(read('layers/home/composables/useHomeSeo.ts')).toContain("t('index.description')")
  })
})
