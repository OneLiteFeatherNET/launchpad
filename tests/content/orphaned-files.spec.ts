import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'
import { locales } from '../../utils/content/locales'

/**
 * With its own `content.config.ts`, @nuxt/content v3 creates no implicit
 * catch-all collection. A file under `content/` that no `source` glob matches
 * is never parsed and no `queryCollection` can reach it — silently. Editing it
 * changes nothing on the site, and no error says so.
 *
 * `content/law/imprint.md` is in exactly that state, and it is not an empty
 * placeholder: it carries a postal address and a phone number that the
 * rendered imprint does not show. Two versions of a legal notice, one of them
 * invisible and neither marked as authoritative.
 *
 * **This check does not fix that**, and the exemption below says why. Choosing
 * between registering a `law` collection and rendering from it, or deleting
 * the file and moving its contents into the page, is a decision about legal
 * text — which phone number is published, whether a § 18 Abs. 2 MStV
 * responsible party is named. That is not a call to make from a test.
 *
 * What this does is stop the *next* orphan from being silent.
 */

const CONTENT_DIR = 'content'
const CONFIG = 'content.config.ts'

/**
 * Known orphan, pending `SEC-09` / `CNT-05`.
 *
 * Listed rather than quietly excluded so the decision stays visible: whoever
 * resolves it deletes this entry, and until then the file cannot be mistaken
 * for live content.
 */
const AWAITING_DECISION = ['law/imprint.md']

function contentFiles(): string[] {
  const found: string[] = []
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full, `${prefix}${entry}/`)
      else if (/\.(md|json|ya?ml)$/.test(entry)) found.push(`${prefix}${entry}`)
    }
  }
  walk(join(repoRoot, CONTENT_DIR), '')
  return found.sort()
}

/** Every `source` glob, with `${locale}` expanded to the real locales. */
function sourceGlobs(): string[] {
  const config = readFileSync(`${repoRoot}/${CONFIG}`, 'utf8')
  const raw = [...config.matchAll(/source:\s*[`'"]([^`'"]+)[`'"]/g)].map(([, glob]) => glob!)
  return raw.flatMap((glob) => glob.includes('${locale}')
      ? locales.map((code) => glob.replace('${locale}', code))
      : [glob])
}

/** Minimal glob matcher: `**` spans directories, `*` does not. */
function matches(glob: string, path: string): boolean {
  const pattern = glob
    .split('/')
    .map((part) => part === '**'
      ? '.*'
      : part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))
    .join('/')
    .replace(/\.\*\//g, '(?:.*/)?')
  return new RegExp(`^${pattern}$`).test(path)
}

describe('content files', () => {
  it('reads both sides, and the matcher behaves', () => {
    // Without this, an empty glob list would report every file as an orphan
    // and an empty file list would report none.
    expect(contentFiles().length).toBeGreaterThan(40)
    expect(sourceGlobs().length).toBeGreaterThan(10)
    expect(sourceGlobs()).toContain('blog/de/**/*.md')

    expect(matches('blog/de/**/*.md', 'blog/de/dev-blog-1.md')).toBe(true)
    expect(matches('faq/de/*.md', 'faq/de/bluemap.md')).toBe(true)
    // A single star must not span a directory boundary.
    expect(matches('faq/de/*.md', 'faq/de/nested/x.md')).toBe(false)
    expect(matches('blog/de/**/*.md', 'law/imprint.md')).toBe(false)
  })

  it('are all reachable through a collection', () => {
    const globs = sourceGlobs()
    const orphans = contentFiles()
      .filter((file) => !AWAITING_DECISION.includes(file))
      .filter((file) => !globs.some((glob) => matches(glob, file)))
    expect(orphans).toEqual([])
  })

  it('lists only orphans in the pending-decision set', () => {
    // If the decision lands and the file becomes reachable, this fails and the
    // entry gets removed rather than lingering as a permanent exemption.
    const globs = sourceGlobs()
    const unreachable = (file: string) => !globs.some((glob) => matches(glob, file))
    expect(AWAITING_DECISION.filter(unreachable)).toEqual(AWAITING_DECISION)
  })
})
