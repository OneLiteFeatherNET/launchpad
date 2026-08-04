import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'
import { isCurrentNavPath } from '../../utils/navigation'

/**
 * Two nav items were lit at once on every subpage.
 *
 * `isActive` was `route.path === path || route.path.startsWith(path + '/')`.
 * The prefix half is what keeps a section link current on its own subpages —
 * `/de/team` staying lit on `/de/team/someone` — but the home link's path is
 * the locale root, and `/de` is a prefix of *everything* under `/de`. So
 * "Übersicht" was marked current on Team, Blog, Community-POIs and the rest.
 *
 * Measured on `/de/team` before the fix — two elements, not one:
 *
 *   <a href="/de"      aria-current="page">
 *   <a href="/de/team" aria-current="page">
 *
 * `aria-current="page"` is the part that matters beyond the highlight: a
 * screen reader announced two different links as the current page, which is
 * not a styling nit but a false statement about where the user is.
 *
 * The rule is depth, not a hardcoded home path: a link matches by prefix only
 * when it has a segment of its own below the locale root.
 */

const ITEM = 'components/features/navigation/NavigationItem.vue'

describe('navigation active state', () => {
  it('marks the exact page', () => {
    expect(isCurrentNavPath('/de', '/de')).toBe(true)
    expect(isCurrentNavPath('/de/team', '/de/team')).toBe(true)
    expect(isCurrentNavPath('/en/blog', '/en/blog')).toBe(true)
  })

  it('keeps a section lit on its own subpages', () => {
    // The reason prefix matching exists at all.
    expect(isCurrentNavPath('/de/team/themeinerlp', '/de/team')).toBe(true)
    expect(isCurrentNavPath('/de/blog/some-article', '/de/blog')).toBe(true)
    expect(isCurrentNavPath('/de/community-poi/yggdrasil', '/de/community-poi')).toBe(true)
  })

  it('is a different answer than the rule it replaces', () => {
    // The old implementation, verbatim. Without this the suite would pass
    // just as well against the buggy version, and prove nothing.
    const previous = (routePath: string, linkPath: string) => routePath === linkPath || routePath.startsWith(`${linkPath}/`)

    expect(previous('/de/team', '/de')).toBe(true)
    expect(isCurrentNavPath('/de/team', '/de')).toBe(false)

    // And it must not have thrown out the behaviour that was correct.
    expect(previous('/de/team/themeinerlp', '/de/team')).toBe(true)
    expect(isCurrentNavPath('/de/team/themeinerlp', '/de/team')).toBe(true)
  })

  it('does not let the locale root claim every page', () => {
    // The bug, in both locales.
    expect(isCurrentNavPath('/de/team', '/de')).toBe(false)
    expect(isCurrentNavPath('/de/blog/some-article', '/de')).toBe(false)
    expect(isCurrentNavPath('/en/community-poi', '/en')).toBe(false)
  })

  it('does not match a sibling that merely shares a prefix', () => {
    // `/de/team` must not light up on `/de/teams` or `/de/team-x`.
    expect(isCurrentNavPath('/de/teams', '/de/team')).toBe(false)
    expect(isCurrentNavPath('/de/team-archive', '/de/team')).toBe(false)
  })

  it('treats an unresolved link as inactive', () => {
    expect(isCurrentNavPath('/de', '#')).toBe(false)
    expect(isCurrentNavPath('/de', '')).toBe(false)
  })

  it('is what the component uses', () => {
    const source = readFileSync(`${repoRoot}/${ITEM}`, 'utf8')
    expect(source).toContain('isCurrentNavPath')
    // The raw prefix test must be gone, not merely wrapped.
    expect(source).not.toMatch(/route\.path\.startsWith\(props\.path/)
  })
})
