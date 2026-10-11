import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, repoRoot } from '../helpers/sources'

/**
 * A markdown block whose name matches no component renders as an unknown
 * element: the post ships, the block is silently missing. This checks that
 * every `::name` (block) and `:name{` (inline) in the blog resolves to a
 * component file of some layer, and that each `::poi-embed` names a POI that
 * exists in the same locale.
 */

/** Block form at the start of a line (`::coords{…}`, `:::name`) and inline `:name{…}`. */
const BLOCK = /^:{2,3}([a-z][a-z-]*)/gm
const INLINE = /(?<=\s):([a-z][a-z-]*)\{/g

function blockNamesIn(text: string): string[] {
  return [...new Set([...text.matchAll(BLOCK), ...text.matchAll(INLINE)].map((match) => match[1] ?? ''))]
}

/** `poi-embed` → `PoiEmbed`, the file name Nuxt registers the component under. */
const componentFileName = (name: string) => `${name.split('-').map((part) => part[0]!.toUpperCase() + part.slice(1)).join('')}.vue`

function componentFileNames(): Set<string> {
  return new Set(collectSourceFiles(['layers'], ['.vue'])
    .filter((file) => /\/components\/[^/]+\.vue$/.test(file))
    .map((file) => file.split('/').pop() ?? ''))
}

const BLOG_LOCALES = ['de', 'en']

function blogFiles(locale: string): string[] {
  return readdirSync(join(repoRoot, 'content/blog', locale))
    .filter((name) => name.endsWith('.md'))
    .map((name) => join(repoRoot, 'content/blog', locale, name))
}

function poiSlugsIn(locale: string): Set<string> {
  const dir = join(repoRoot, 'content/community-poi', locale)
  const slugs = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => readFileSync(join(dir, name), 'utf8').match(/^slug: '?([^'\n]+?)'?$/m)?.[1])
  return new Set(slugs.filter((slug): slug is string => Boolean(slug)))
}

/**
 * A block form (`::poi-embed{…}`) opens a block that runs to its closing `::`
 * line. Without one, every paragraph after it becomes the block's children,
 * and a component that does not render its slot drops them silently.
 */
function blockBalanceIn(text: string): { opened: number, closed: number } {
  return {
    opened: (text.match(/^::[a-z][a-z-]*/gm) ?? []).length,
    closed: (text.match(/^::\s*$/gm) ?? []).length,
  }
}

describe('markdown block names', () => {
  it('counts an opened block with no closing line as unclosed', () => {
    expect(blockBalanceIn('::poi-embed{slug="x"}\n\nText danach.\n')).toEqual({ opened: 1, closed: 0 })
  })

  it('closes every block used in content/blog', () => {
    const offenders: string[] = []
    for (const locale of BLOG_LOCALES) {
      for (const file of blogFiles(locale)) {
        const { opened, closed } = blockBalanceIn(readFileSync(file, 'utf8'))
        if (opened !== closed) offenders.push(`${file.slice(repoRoot.length + 1)}: ${opened} opened, ${closed} closed`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('finds block and inline names, and nothing from times or closing fences', () => {
    expect(blockNamesIn('::poi-embed{slug="x"}\nBei :coords{x=1} um 12:30 Uhr.\n::gallery\n---\n---\n::\n:::').sort())
      .toEqual(['coords',
'gallery',
'poi-embed'])
  })

  it('resolves every block used in content/blog to a component of some layer', () => {
    const components = componentFileNames()
    const offenders: string[] = []
    const used = new Set<string>()
    for (const locale of BLOG_LOCALES) {
      for (const file of blogFiles(locale)) {
        for (const name of blockNamesIn(readFileSync(file, 'utf8'))) {
          used.add(name)
          if (!components.has(componentFileName(name))) {
            offenders.push(`${file.slice(repoRoot.length + 1)}: ::${name}`)
          }
        }
      }
    }
    // Guard against a vacuous pass: the blog must actually use blocks.
    expect(used.size).toBeGreaterThan(0)
    expect(offenders).toEqual([])
  })

  it('names only community POIs that exist in the same locale', () => {
    const offenders: string[] = []
    for (const locale of BLOG_LOCALES) {
      const pois = poiSlugsIn(locale)
      for (const file of blogFiles(locale)) {
        for (const match of readFileSync(file, 'utf8').matchAll(/::poi-embed\{slug="([^"]+)"\}/g)) {
          if (!pois.has(match[1] ?? '')) offenders.push(`${file.slice(repoRoot.length + 1)}: ${match[1]}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
