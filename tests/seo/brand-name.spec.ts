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
