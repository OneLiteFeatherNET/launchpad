import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')

describe('join page', () => {
  const page = read('pages/join.vue')

  it('has exactly one h1', () => {
    expect(page.match(/<h1[\s>]/g)).toHaveLength(1)
  })

  it('describes itself with a title, description and breadcrumb', () => {
    expect(page).toMatch(/usePageSeo\(\{\s*title: t\('join\.title'\)/)
    expect(page).toContain("description: t('join.description')")
    expect(page).toMatch(/useBreadcrumbs\(/)
  })

  it('takes both addresses from the connect document, never from literals', () => {
    expect(page).toMatch(/useServerConnect\(\)/)
    expect(page).toMatch(/<ServerAddresses[^>]*:java-address="connect\.javaAddress"/)
    expect(page).toMatch(/<ServerAddresses[^>]*:bedrock-host="connect\.bedrockHost"/)
    expect(page).toMatch(/<ServerAddresses[^>]*:bedrock-port="connect\.bedrockPort"/)
    expect(page).not.toMatch(/onelitefeather\.(net|com)/)
    expect(page).not.toMatch(/19132/)
  })

  it('links to Discord through the shared runtime invite', () => {
    expect(page).toContain('discordUrl')
  })

  it('reads no query, cookie or header', () => {
    expect(page).not.toMatch(/route\.query|useCookie|useRequestHeaders/)
  })

  it('renders no raw HTML', () => {
    expect(page).not.toMatch(/v-html/)
  })
})

describe('server connect composable', () => {
  const composable = read('layers/home/composables/useServerConnect.ts')

  it('loads the connect document for the active locale through the repository', () => {
    expect(composable).toContain('useContentRepository()')
    expect(composable).toContain('repo.getServerConnect(activeLocale.value)')
  })

  it('shares its cache key with the home page, which loads the same document', () => {
    expect(composable).toContain('`server-connect-${activeLocale.value}`')
  })
})
