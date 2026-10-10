import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')

const ITEMS = ['Blog',
'Poi',
'Event',
'Project']

describe('carousel new badge', () => {
  it.each(ITEMS)('shows a text chip on a new %s slide', (name) => {
    const source = read(`layers/home/components/CarouselItem${name}.vue`)
    expect(source).toMatch(/<M3Chip v-if="item\.isNew"[^>]*:label="t\('carousel\.new'\)"/)
  })

  it('renders project slides', () => {
    const source = read('layers/home/components/Carousel.vue')
    expect(source).toContain('CarouselItemProject')
    expect(source).toMatch(/case 'project': return CarouselItemProject/)
  })

  it('translates the marker and the project wording in both languages', () => {
    for (const locale of ['de', 'en']) {
      const carousel = JSON.parse(read(`i18n/locales/${locale}.json`)).carousel
      for (const key of ['new',
'new_label',
'project_tag',
'project_cta',
'project_cta_aria']) {
        expect(carousel[key], `${locale}: carousel.${key}`).toEqual(expect.any(String))
      }
      expect(carousel.new_label).toContain('{title}')
    }
  })
})
