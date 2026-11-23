import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * A client-side navigation changes the title but a screen reader says nothing.
 * NuxtRouteAnnouncer reads document.title (built from useHead's title
 * template) into a visually hidden live region after each navigation.
 */
const template = readFileSync(`${repoRoot}/app.vue`, 'utf8').split('</template>')[0] ?? ''

describe('route announcer', () => {
  it('is mounted in the app shell', () => {
    expect(template, 'app.vue must render <NuxtRouteAnnouncer />').toMatch(/<NuxtRouteAnnouncer\s*\/>/)
  })

  it('sits outside the layout, so every layout gets it', () => {
    const announcer = template.indexOf('<NuxtRouteAnnouncer')
    const layoutStart = template.indexOf('<NuxtLayout')
    const layoutEnd = template.indexOf('</NuxtLayout>')
    expect(announcer).toBeGreaterThan(-1)
    expect(announcer < layoutStart || announcer > layoutEnd, 'announcer must not be inside NuxtLayout').toBe(true)
  })

  it('announces the page title, which the title template supplies', () => {
    const source = readFileSync(`${repoRoot}/app.vue`, 'utf8')
    expect(source).toContain('titleTemplate')
  })
})
