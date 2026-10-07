import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')

describe('about page', () => {
  const page = read('pages/about.vue')

  it('has one h1 and five sections in order, the strip bringing its own h2', () => {
    expect(page.match(/<h1[\s>]/g)).toHaveLength(1)
    const sections = [
      ...page.matchAll(/<h2[^>]*>\s*\{\{ t\('about\.sections\.(\w+)'\) \}\}|<(CommunityStrip)\b/g)
    ].map(m => m[1] ?? 'numbers')
    expect(sections).toEqual(['who',
'pillars',
'numbers',
'work',
'join'])
  })

  it('describes itself as an AboutPage', () => {
    expect(page).toMatch(/usePageSeo\(\{\s*title: t\('about\.title'\)/)
    expect(page).toContain("schemaType: 'AboutPage'")
    expect(page).toContain("description: t('about.description')")
    expect(page).toMatch(/useBreadcrumbs\(/)
  })

  it('points about at the existing organization node', () => {
    expect(page).toMatch(/about:\s*\{\s*'@id': `\$\{site\.url\}\/#identity`/)
    expect(page).not.toMatch(/defineOrganization/)
  })

  it('takes the numbers from the orchestrating composable', () => {
    expect(page).toContain('useCommunityOverview()')
    expect(page).toMatch(/<CommunityStrip[^>]*:numbers="numbers"/)
    expect(page).toMatch(/:to="`\/\$\{locale\}\/community`"/)
    expect(page).not.toMatch(/useCommunityPoi|useEvents|useTeamRoster|useOpenCollective/)
  })

  it('hands the shared discord invite to the join section', () => {
    expect(page).toContain('discordUrl')
    expect(page).toMatch(/<AboutJoin[^>]*:discord-url="discordUrl"/)
  })

  it('reads no query, cookie or header', () => {
    expect(page).not.toMatch(/route\.query|useCookie|useRequestHeaders/)
  })
})

describe('organization identity', () => {
  it('was founded in 2021', () => {
    expect(read('nuxt.config.ts')).toMatch(/foundingDate:\s*'2021'/)
  })
})
