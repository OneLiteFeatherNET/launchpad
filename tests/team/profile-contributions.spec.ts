import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, repoRoot } from '../helpers/sources'

/**
 * The profile's "posts" and "events" sections are put together by the page,
 * which may know both domains; the team layer must not learn about either.
 */

const page = () => readFileSync(`${repoRoot}/pages/team/[slug].vue`, 'utf8')

const OTHER_DOMAINS = new RegExp([
  'AuthorPostList',
  'HostedEventList',
  'ProjectGrid',
  'useBlogPostsByAuthor',
  'useEventsByHost',
  'useProjectsByMaintainer',
].join('|'))

describe('team profile contributions', () => {
  it('composes the post list in the page, only when there are posts', () => {
    expect(page()).toMatch(/<AuthorPostList[^>]*\sv-if="[^"]*posts[^"]*length/)
  })

  it('composes the event list in the page, only when there are events', () => {
    expect(page()).toMatch(/<HostedEventList[^>]*\sv-if="[^"]*events[^"]*length/)
  })

  it('titles both sections from the team profile messages', () => {
    expect(page()).toContain("t('team.profile.posts')")
    expect(page()).toContain("t('team.profile.events')")
  })

  it('composes the maintained projects in the page, only when there are some', () => {
    expect(page()).toMatch(/<section v-if="maintainedProjects\.length"/)
    expect(page()).toContain('<ProjectGrid :projects="maintainedProjects"')
    expect(page()).toContain('useProjectsByMaintainer(memberSlug)')
  })

  it('titles the projects section from the team profile messages', () => {
    expect(page()).toContain("t('team.profile.projects')")
    expect(page()).toContain("t('team.profile.projects_intro'")
  })

  it('keeps blog, events and projects out of the team layer', () => {
    const files = collectSourceFiles(['layers/team'], ['.ts', '.vue'])
    const offenders = files.filter((file) => OTHER_DOMAINS.test(readFileSync(file, 'utf8')))
    expect(files.length).toBeGreaterThan(3)
    expect(offenders).toEqual([])
  })
})
