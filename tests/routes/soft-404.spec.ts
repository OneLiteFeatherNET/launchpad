import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * A page that renders "not found" text while answering HTTP 200 is a soft 404.
 * Search engines index it, so an unbounded URL space — every possible slug —
 * turns into thin duplicate content, and monitoring never sees an error.
 *
 * The correct pattern is already in the repository: useBlogContent resolves
 * the article, then throws `createError({ statusCode: 404, fatal: true })`
 * when the slug matched nothing. useTeamProfile resolved a member the same way
 * and simply rendered a placeholder.
 *
 * On what this asserts: the status code only exists once a real server has
 * handled a request, so the honest test is end-to-end. I tried that first —
 * @nuxt/test-utils with `server: true` — and abandoned it: the build hit a
 * Rollup sourcemap conflict, and after working around that every request came
 * back unreachable, including the positive control. 64 seconds per run for a
 * setup that fragile is a bad trade.
 *
 * So this checks the weaker, structural property instead: a composable that
 * resolves a route slug must contain a 404 `createError`. It cannot prove the
 * response code, and it would not catch the throw being unreachable. It does
 * catch a new detail page shipping without the guard at all, which is the
 * mistake that actually happened.
 */

const SLUG_LOOKUP = /route\.params\.slug/
const NOT_FOUND_THROW = /createError\(\{[^}]*statusCode:\s*404/s

describe('slug-resolving composables', () => {
  const composables = collectSourceFiles(['composables'], ['.ts'])
    .filter((file) => SLUG_LOOKUP.test(readFileSync(file, 'utf8')))

  it('finds the composables that resolve a slug', () => {
    // Without this the suite passes vacuously the moment the pattern changes
    // — for instance if a page switches to useRoute().params.id.
    expect(composables.length).toBeGreaterThan(0)
  })

  it('each throws a 404 when the slug matches nothing', () => {
    const missing = composables
      .filter((file) => !NOT_FOUND_THROW.test(readFileSync(file, 'utf8')))
      .map(relativeToRepo)
    expect(missing).toEqual([])
  })

  it('uses fatal: true so the error page replaces the route', () => {
    // Without `fatal`, Nuxt surfaces the error inline and the route still
    // answers 200 — the soft 404 survives the fix.
    const nonFatal = composables
      .filter((file) => {
        const text = readFileSync(file, 'utf8')
        const call = /createError\(\{[^}]*statusCode:\s*404[^}]*\}\)/s.exec(text)?.[0]
        return call !== undefined && !/fatal:\s*true/.test(call)
      })
      .map(relativeToRepo)
    expect(nonFatal).toEqual([])
  })
})

describe('the pattern this copies', () => {
  it('matches how useBlogContent already does it', () => {
    // Pins the reference implementation: if the blog guard is ever removed,
    // this test should fail rather than quietly lower the bar for everyone.
    const blog = collectSourceFiles(['composables'], ['.ts'])
      .find((file) => basename(file) === 'useBlogContent.ts')
    expect(blog).toBeDefined()
    const text = readFileSync(blog as string, 'utf8')
    expect(NOT_FOUND_THROW.test(text)).toBe(true)
    expect(/fatal:\s*true/.test(text)).toBe(true)
  })
})
