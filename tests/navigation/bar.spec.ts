import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { NAV_ITEM_DESKTOP } from '../../layers/navigation/utils/navItemClasses'
import { repoRoot } from '../helpers/sources'

const bar = readFileSync(`${repoRoot}/layers/navigation/components/NavigationBar.vue`, 'utf8')

describe('navigation bar', () => {
  it('keeps the logo and the labels on one line', () => {
    expect(bar).toMatch(/logoLinkClass\s*=\s*'[^']*shrink-0[^']*whitespace-nowrap/)
    expect(NAV_ITEM_DESKTOP).toContain('whitespace-nowrap')
  })

  it('wires the group button to its menu', () => {
    expect(bar).toMatch(/:aria-controls="groupMenuId\(item\)"/)
    expect(bar).toMatch(/:id="groupMenuId\(item\)"/)
    expect(bar).toMatch(/:aria-expanded="openGroup === item\.textKey/)
  })

  it('shows Discord as a tonal button on the desktop bar', () => {
    expect(bar).toMatch(/<M3Button[^>]*variant="tonal"[^>]*:href="discordUrl"/)
  })

  it('switches to the mobile menu at lg', () => {
    expect(bar).toContain('hidden items-center gap-2 lg:flex')
    expect(bar).toContain('lg:hidden')
  })
})
