import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ICON_MAX_LINES,
  PROJECTS,
  SOCIAL_MAX_LINES,
  assertFits,
  frontmatterOf,
  highlight,
  maxCodeLines,
  nameOf,
  projectImageKey,
  selectProjects,
  snippetOf,
  socialNameOf
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
    expect(() => snippetOf(LINES, [1, 4])).toThrow('4 lines')
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

// A code row is 33px (22px font at 1.5 line height); the window's border and header take 54px.
describe('maxCodeLines', () => {
  it('counts a line that ends exactly on the bottom border', () => {
    expect(maxCodeLines({ top: 0, bottom: 54 + 3 * 33 + 2, bodyPadding: 0 })).toBe(3)
  })

  it('does not count a line that the bottom border cuts', () => {
    expect(maxCodeLines({ top: 0, bottom: 54 + 3 * 33 + 1, bodyPadding: 0 })).toBe(2)
  })

  it('leaves the body padding above the first line', () => {
    expect(maxCodeLines({ top: 0, bottom: 54 + 20 + 3 * 33 + 2, bodyPadding: 20 })).toBe(3)
  })
})

describe('the card limits', () => {
  it('fit ten lines in the icon and eight in the social card, as the rendered layout shows', () => {
    expect(ICON_MAX_LINES).toBe(10)
    expect(SOCIAL_MAX_LINES).toBe(8)
  })
})

describe('assertFits', () => {
  const lines = (count: number) => Array.from({ length: count }, (_, index) => `line ${index + 1}`)

  it('accepts a snippet of exactly the lines a card shows', () => {
    expect(() => assertFits(lines(8), 8, 'falco social card')).not.toThrow()
  })

  it('refuses a snippet taller than the card, naming the card and both counts', () => {
    expect(() => assertFits(lines(9), 8, 'falco social card'))
      .toThrow('falco social card: the snippet has 9 lines but the card shows 8')
  })
})

describe('line ranges', () => {
  it.each(PROJECTS.map(project => [project.slug, project]))('%s: the range fits both cards', (_slug, project) => {
    const [start, end] = project.source.lines as [number, number]
    const lineCount = end - start + 1
    expect(lineCount).toBeLessThanOrEqual(ICON_MAX_LINES)
    expect(lineCount).toBeLessThanOrEqual(SOCIAL_MAX_LINES)
  })
})

describe('selectProjects', () => {
  it('keeps the requested projects in PROJECTS order', () => {
    expect(selectProjects(['titan', 'falco']).map(project => project.slug)).toEqual(['falco', 'titan'])
  })

  it('refuses a slug that is not configured instead of skipping it', () => {
    expect(() => selectProjects(['falco', 'unknown'])).toThrow('unknown project slug: unknown')
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

  it.each(PROJECTS.map(project => [project.slug, project]))('%s: both locales point at the uploaded images', (slug, project) => {
    for (const locale of ['de', 'en']) {
      const text = readFileSync(join(repoRoot, `content/projects/${locale}/${slug}.md`), 'utf8')
      const data = frontmatterOf(text)
      expect(data.logo).toBe(OFFICIAL_LOGOS[slug] ?? `/${projectImageKey(slug, 'icon')}`)
      expect(data.socialImage).toBe(`/${projectImageKey(slug, socialNameOf(project))}`)
    }
  })

  it('keeps the social card of a re-rendered project under a new key', () => {
    expect(socialNameOf(PROJECTS.find(project => project.slug === 'otis'))).toBe('social-v2')
  })

  it('names the social card social when a project does not override it', () => {
    expect(socialNameOf({ slug: 'falco' })).toBe('social')
  })
})
