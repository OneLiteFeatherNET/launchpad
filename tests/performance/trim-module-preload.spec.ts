import { describe, expect, it } from 'vitest'
import { trimModulePreload, type Manifest } from '../../scripts/trimModulePreload'

const chunk = (imports: string[] = [], extra: Record<string, unknown> = {}) => {
  return { preload: true, prefetch: true, imports, ...extra }
}

const manifest = (): Manifest => ({
  'entry.js': chunk(['_vue.js'], { isEntry: true }),
  '_vue.js': chunk(['_shared.js']),
  '_shared.js': chunk(),
  'pages/index.vue': chunk(['_shared.js', '_page-only.js']),
  '_page-only.js': chunk(),
  'layouts/default.vue': chunk(['_vue.js']),
})

const KEPT = 'entry.js _vue.js _shared.js'.split(' ')
const TRIMMED = 'pages/index.vue _page-only.js layouts/default.vue'.split(' ')

describe('trimModulePreload', () => {
  it('keeps the entry chunk and everything it imports statically, however deep', () => {
    const trimmed = trimModulePreload(manifest())
    for (const key of KEPT) {
      expect(trimmed[key], key).toMatchObject({ preload: true, prefetch: true })
    }
  })

  it('switches preload and prefetch off for route, layout and page-only chunks', () => {
    const trimmed = trimModulePreload(manifest())
    for (const key of TRIMMED) {
      expect(trimmed[key], key).toMatchObject({ preload: false, prefetch: false })
    }
  })

  it('does not change the manifest it was given', () => {
    const input = manifest()
    trimModulePreload(input)
    expect(input).toEqual(manifest())
  })

  it('keeps every other field of a trimmed chunk', () => {
    const input = manifest()
    input['pages/index.vue'] = chunk(['_page-only.js'], { file: 'abc.js', name: 'pages' })
    expect(trimModulePreload(input)['pages/index.vue']).toMatchObject({ file: 'abc.js', name: 'pages' })
  })

  it('terminates on circular imports and ignores imports missing from the manifest', () => {
    const input: Manifest = {
      'entry.js': chunk(['_a.js', '_gone.js'], { isEntry: true }),
      '_a.js': chunk(['_b.js']),
      '_b.js': chunk(['_a.js']),
    }
    expect(trimModulePreload(input)['_b.js']).toMatchObject({ preload: true })
  })
})
