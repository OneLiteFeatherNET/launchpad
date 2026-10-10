import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { OG_SECTIONS, sectionOgImage } from '../../layers/content-core/utils/sectionOgImage'
import { SECTIONS, uploadKey } from '../../scripts/render-og-images.mjs'
import { repoRoot } from '../helpers/sources'

/**
 * Section pages share one fixed card per section and locale, rendered by
 * scripts/render-og-images.mjs and uploaded to images/og/<section>-<locale>.png.
 * A page that loses its `image:` argument silently falls back to
 * og-default.png, which is the regression these tests guard against.
 */

const LOCALES = ['de', 'en'] as const

/** Section page -> the usePageSeo/useHomeSeo call that must pass its card. */
const SECTION_PAGES: Array<[section: string, file: string]> = [
  ['home', 'pages/index.vue'],
  ['blog', 'pages/blog/index.vue'],
  ['projects', 'pages/projects/index.vue'],
  ['community', 'pages/community.vue'],
  ['community-poi', 'pages/community-poi/index.vue'],
  ['events', 'pages/events/index.vue'],
  ['team', 'pages/team/index.vue'],
  ['about', 'pages/about.vue'],
  ['bluemap', 'pages/bluemap.vue']
]

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')
const i18n = (locale: string) => JSON.parse(read(`i18n/locales/${locale}.json`)) as Record<string, unknown>
const lookup = (json: Record<string, unknown>, key: string): unknown => key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], json)

describe('section og image paths', () => {
  it('gives every section a card for each locale at the bucket path', () => {
    for (const section of OG_SECTIONS) {
      for (const locale of LOCALES) {
        expect(sectionOgImage(section, locale)).toBe(`/images/og/${section}-${locale}.png`)
      }
    }
  })

  it('renders exactly the sections the composable can reference', () => {
    expect(SECTIONS.map(entry => entry.section)).toEqual([...OG_SECTIONS])
  })

  it('uploads one card per section and locale under the same key', () => {
    const keys = SECTIONS.flatMap(entry => LOCALES.map(locale => uploadKey(entry.section, locale)))
    expect(keys).toHaveLength(OG_SECTIONS.length * LOCALES.length)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain('images/og/community-poi-de.png')
  })
})

describe('section card text', () => {
  it('reads every title and description from both locale files', () => {
    for (const locale of LOCALES) {
      const json = i18n(locale)
      for (const entry of SECTIONS) {
        for (const key of [entry.title, entry.description]) {
          expect(typeof lookup(json, key), `${locale}: ${key}`).toBe('string')
          expect(String(lookup(json, key)).length, `${locale}: ${key}`).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('section pages pass their card', () => {
  it.each(SECTION_PAGES)('%s (%s) sets its section card for the current locale', (section, file) => {
    expect(read(file)).toContain(`image: sectionOgImage('${section}', locale.value)`)
  })

  it('finds every section page it checks', () => {
    // Guards against a renamed file making the loop above check nothing.
    expect(SECTION_PAGES).toHaveLength(OG_SECTIONS.length)
  })

  it('falls project detail pages without a logo back to the projects card', () => {
    expect(read('pages/projects/[...slug].vue')).toContain('image: project.value?.logo || sectionOgImage(\'projects\', locale.value)')
  })

  it('keeps the own images of content pages', () => {
    expect(read('pages/events/[...slug].vue')).toContain('image: event.value?.thumbnail')
    expect(read('pages/community-poi/[...slug].vue')).toContain('image: poi.value?.thumbnail')
    expect(read('pages/team/[slug].vue')).toContain('image: avatarSrc.value')
    expect(read('layers/blog/composables/useArticleSeo.ts')).toContain('blog.value?.headerImage')
  })
})
