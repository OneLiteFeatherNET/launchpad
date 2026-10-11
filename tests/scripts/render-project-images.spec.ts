import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PROJECTS,
  frontmatterOf,
  highlight,
  nameOf,
  projectImageKey,
  snippetOf
} from '../../scripts/render-project-images.mjs'
import { repoRoot } from '../helpers/sources'

const LINES = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join('\n')

describe('snippetOf', () => {
  it('takes the 1-based inclusive line range', () => {
    expect(snippetOf(LINES, [2, 7])).toEqual([
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7'
    ])
  })

  it('removes the indentation shared by the snippet', () => {
    const text = [
      'x',
      '    if (a) {',
      '        b();',
      '    }',
      '    c();',
      '    d();',
      '    e();'
    ].join('\n')
    expect(snippetOf(text, [2, 7])).toEqual([
      'if (a) {',
      '    b();',
      '}',
      'c();',
      'd();',
      'e();'
    ])
  })

  it('refuses a range too short to read on a card', () => {
    expect(() => snippetOf(LINES, [1, 5])).toThrow('5 lines')
  })

  it('refuses a range too long for a card', () => {
    expect(() => snippetOf(`${LINES}\nline 11\nline 12\nline 13`, [1, 13])).toThrow('13 lines')
  })
})

describe('highlight', () => {
  it('colours Java keywords, types and strings and leaves identifiers plain', () => {
    const [tokens] = highlight(['return new Falco("x");'], 'java')
    expect(tokens).toEqual([
      { kind: 'keyword', text: 'return' },
      { kind: 'plain', text: ' ' },
      { kind: 'keyword', text: 'new' },
      { kind: 'plain', text: ' ' },
      { kind: 'type', text: 'Falco' },
      { kind: 'plain', text: '(' },
      { kind: 'string', text: '"x"' },
      { kind: 'plain', text: ');' }
    ])
  })

  it('keeps a Java comment to the end of its line', () => {
    const [tokens] = highlight(['.ownsLoader(true) // close it'], 'java')
    expect(tokens.at(-1)).toEqual({ kind: 'comment', text: '// close it' })
  })

  it('colours a YAML key, its value and a trailing comment', () => {
    const [tokens] = highlight(['  endDelay: 300 # ticks'], 'yaml')
    expect(tokens).toEqual([
      { kind: 'plain', text: '  ' },
      { kind: 'key', text: 'endDelay' },
      { kind: 'plain', text: ': ' },
      { kind: 'number', text: '300' },
      { kind: 'plain', text: ' ' },
      { kind: 'comment', text: '# ticks' }
    ])
  })

  it('keeps a hash inside a YAML string out of the comment colour', () => {
    const [tokens] = highlight(["  color: '#ff00ff'"], 'yaml')
    expect(tokens.some((token: { kind: string }) => token.kind === 'comment')).toBe(false)
  })
})

describe('project images', () => {
  it('keys each image by project and name', () => {
    expect(projectImageKey('falco', 'social')).toBe('images/projects/falco/social.png')
  })

  it('names a project by the part of its title before the subtitle', () => {
    expect(nameOf('Anti-RedstoneClock Remastered: Paper plugin')).toBe('Anti-RedstoneClock Remastered')
  })

  // The project's own icon is the logo where one exists; the rendered icon is the fallback.
  const OFFICIAL_LOGOS: Record<string, string> = {
    'anti-redstoneclock-remastered': '/images/projects/arcr.webp'
  }

  it.each(PROJECTS.map(project => [project.slug]))('%s: both locales point at the uploaded images', (slug) => {
    for (const locale of ['de', 'en']) {
      const text = readFileSync(join(repoRoot, `content/projects/${locale}/${slug}.md`), 'utf8')
      const data = frontmatterOf(text)
      expect(data.logo).toBe(OFFICIAL_LOGOS[slug] ?? `/${projectImageKey(slug, 'icon')}`)
      expect(data.socialImage).toBe(`/${projectImageKey(slug, 'social')}`)
    }
  })
})
