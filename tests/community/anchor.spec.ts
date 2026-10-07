import { describe, expect, it } from 'vitest'
import { personAnchor } from '../../shared/utils/personAnchor'

describe('personAnchor', () => {
  it('lower-cases and prefixes the name', () => {
    expect(personAnchor('Marc')).toBe('person-marc')
  })

  it('treats spellings of one name alike', () => {
    expect(personAnchor('Blndr2')).toBe(personAnchor(' blndr2 '))
  })

  it('drops accents', () => {
    expect(personAnchor('Bünyamin Arif')).toBe('person-bunyamin-arif')
  })

  it('turns runs of other characters into one dash and trims them', () => {
    expect(personAnchor('  IronApollo - FAWE!! ')).toBe('person-ironapollo-fawe')
  })

  it('falls back to a bare prefix when nothing usable is left', () => {
    expect(personAnchor('🙂')).toBe('person')
  })
})
