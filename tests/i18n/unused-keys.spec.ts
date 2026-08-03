import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, repoRoot } from '../helpers/sources'

/**
 * The complement of `message-keys.spec.ts`. That one asks whether every key a
 * call site uses exists; this one asks whether every key that exists is used.
 *
 * A stale message is not inert. Translators are asked to keep it current, it
 * turns up when someone greps for wording that is live somewhere else, and a
 * near-duplicate is the sort of thing that gets picked by mistake — this file
 * carried `footer.imprint`, `footer.legal` and `footer.privacy_policy` while
 * the footer actually renders `footer.terms` and `footer.privacy`.
 *
 * Dynamically built keys are the reason a check like this needs care. Six
 * prefixes are assembled at runtime — `t(`team.ranks.${rank}`)` and friends —
 * and every key beneath them would read as unused. They are detected from the
 * source rather than listed by hand, so adding a seventh does not silently
 * turn part of the locale file into a blind spot.
 */

const CORPUS_DIRS = ['components',
  'pages',
  'layouts',
  'composables',
  'utils',
  'plugins',
  'server',
  'types']
const ROOT_FILES = ['app.vue',
  'error.vue',
  'nuxt.config.ts']
const LOCALES = ['de', 'en']

/** ``t(`community_poi.status.${poi.status}`)`` — the part before the hole. */
const DYNAMIC_PREFIX = /[`'"]([a-z][\w.]*)\.\$\{/g

type Messages = Record<string, unknown>

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(messages)) {
    const path = `${prefix}${key}`
    if (value !== null && typeof value === 'object') Object.assign(flat, flatten(value as Messages, `${path}.`))
    else flat[path] = String(value)
  }
  return flat
}

function locale(code: string): Record<string, string> {
  return flatten(JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${code}.json`, 'utf8')))
}

function corpus(): string {
  const files = collectSourceFiles(CORPUS_DIRS, ['.vue',
'.ts',
'.js'])
    .concat(ROOT_FILES.map((file) => `${repoRoot}/${file}`))
  return files.map((file) => readFileSync(file, 'utf8')).join('\n')
}

describe('translation keys', () => {
  const text = corpus()
  const dynamicPrefixes = [...new Set([...text.matchAll(DYNAMIC_PREFIX)].map(([, prefix]) => prefix!))]

  it('reads the locale files and the call sites', () => {
    // Without this, an empty corpus would read as "everything is used".
    expect(Object.keys(locale('de')).length).toBeGreaterThan(200)
    expect(text.length).toBeGreaterThan(100_000)
    expect(dynamicPrefixes).toContain('team.ranks')

    expect(flatten({ a: { b: 'x' }, c: 1 })).toEqual({ 'a.b': 'x', c: '1' })
  })

  it('are declared in both locales', () => {
    expect(Object.keys(locale('en')).sort()).toEqual(Object.keys(locale('de')).sort())
  })

  it('are all referenced somewhere', () => {
    const orphans = Object.keys(locale('de'))
      .filter((key) => !dynamicPrefixes.some((prefix) => key.startsWith(`${prefix}.`)))
      .filter((key) => !text.includes(key))
    expect(orphans).toEqual([])
  })

  it.each(LOCALES)('%s has no placeholder entries left', (code) => {
    const suspicious = Object.entries(locale(code))
      .filter(([key, value]) => /^(TDB|TODO|TBD|FIXME)$/i.test(key) || /^(TODO|TBD|FIXME)\b/i.test(value))
      .map(([key]) => key)
    expect(suspicious).toEqual([])
  })
})
