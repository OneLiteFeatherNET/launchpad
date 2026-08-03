import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * Security overrides in `pnpm-workspace.yaml` pin a package away from a
 * vulnerable range. Two overrides for the *same* package whose ranges overlap
 * are a question without an answer: a version inside both matches two rules
 * demanding different floors, and which one pnpm applies is not something to
 * leave to reading order.
 *
 * The pair that prompted this:
 *
 *   vite@>=7.1.0 <=7.1.10: '>=7.1.11'
 *   vite@>=7.1.0 <=7.1.4:  '>=7.1.5'
 *
 * Every version the second rule covers is also covered by the first, which
 * demands a strictly higher floor. So the narrower rule can only ever weaken
 * the outcome — for vite 7.1.3 it asks for 7.1.5 while the other asks for
 * 7.1.11 — and it can never strengthen it.
 *
 * `tar-fs` also appears twice and is fine: `>=2.0.0 <2.1.4` and
 * `>=3.0.0 <3.1.1` are disjoint, one per major. That is the shape a repeated
 * package is supposed to have.
 *
 * Deliberately not checked: whether a range is reachable at all given the
 * lockfile. `nuxt@>=3.6.0 <3.19.0` cannot match a tree pinned to nuxt 4, but
 * an unreachable override is dormant insurance, not a defect, and dropping it
 * is a risk judgement rather than a rule.
 */

const WORKSPACE = 'pnpm-workspace.yaml'

interface Bound { version: number[], inclusive: boolean }
interface Override { pkg: string, line: number, low: Bound | null, high: Bound | null }

const parts = (version: string): number[] => version.split('.').map(Number)

function compare(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** Parses `'pkg@>=1.0.0 <2.0.0': '>=2.0.0'` and the `<X` / bare forms. */
function overrides(): Override[] {
  const text = readFileSync(`${repoRoot}/${WORKSPACE}`, 'utf8')
  const body = text.slice(text.indexOf('overrides:'))
  const found: Override[] = []
  body.split('\n').forEach((line, index) => {
    const entry = /^\s+'?([@\w./-]+?)'?(?:@([^']*?))?'?\s*:\s*'/.exec(line)
    if (!entry) return
    const [, pkg,
range] = entry
    if (!range) {
      found.push({ pkg: pkg!, line: index, low: null, high: null })
      return
    }
    const low = /(?:^|\s)>=\s*([\d.]+)/.exec(range)
    const high = /(?:^|\s)<(=?)\s*([\d.]+)/.exec(range)
    found.push({
      pkg: pkg!,
      line: index,
      low: low ? { version: parts(low[1]!), inclusive: true } : null,
      high: high ? { version: parts(high[2]!), inclusive: high[1] === '=' } : null
    })
  })
  return found
}

/** Do two ranges admit at least one common version? */
function overlap(a: Override, b: Override): boolean {
  // An unbounded side cannot rule out an intersection.
  if (a.low && b.high) {
    const cmp = compare(a.low.version, b.high.version)
    if (cmp > 0 || (cmp === 0 && !b.high.inclusive)) return false
  }
  if (b.low && a.high) {
    const cmp = compare(b.low.version, a.high.version)
    if (cmp > 0 || (cmp === 0 && !a.high.inclusive)) return false
  }
  return true
}

describe('dependency overrides', () => {
  const all = overrides()

  it('parses the ranges it is going to compare', () => {
    // Without this, a parse returning nothing would pass the rule below.
    expect(all.length).toBeGreaterThan(10)
    expect(all.filter(o => o.pkg === 'vite').length).toBeGreaterThan(0)
    expect(all.filter(o => o.pkg === 'tar-fs')).toHaveLength(2)

    // The comparator has to order across component counts and widths.
    expect(compare(parts('7.1.10'), parts('7.1.4'))).toBeGreaterThan(0)
    expect(compare(parts('2.0'), parts('2.0.0'))).toBe(0)

    // And the disjointness test has to agree with the tar-fs pair.
    const [first, second] = all.filter(o => o.pkg === 'tar-fs')
    expect(overlap(first!, second!)).toBe(false)
  })

  it('never states two overlapping rules for one package', () => {
    const clashes: string[] = []
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        if (all[i]!.pkg !== all[j]!.pkg) continue
        if (overlap(all[i]!, all[j]!)) clashes.push(`${all[i]!.pkg}: two overrides cover a common version`)
      }
    }
    expect(clashes).toEqual([])
  })
})
