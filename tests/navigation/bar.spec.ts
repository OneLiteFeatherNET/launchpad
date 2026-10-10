import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { NAV_ITEM_DESKTOP } from '../../layers/navigation/utils/navItemClasses'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')
const bar = read('layers/navigation/components/NavigationBar.vue')
const layout = read('layouts/default.vue')

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

  it('shows Play as the filled and Discord as the tonal button, Play first', () => {
    const play = bar.search(/<M3Button[^>]*variant="filled"/)
    const discord = bar.search(/<M3Button[^>]*variant="tonal"/)
    expect(play, 'filled button').toBeGreaterThan(-1)
    expect(discord, 'tonal button').toBeGreaterThan(play)
    expect(bar).toMatch(/<M3Button[^>]*variant="tonal"[^>]*:href="discordUrl"/)
    expect(bar).toMatch(/<M3Button[^>]*variant="filled"[^>]*:to="playPath"/)
  })

  it('shows both call to action links in the mobile menu, Play first', () => {
    const mobile = bar.slice(bar.indexOf('<!-- Mobile menu overlay -->'))
    expect(mobile.indexOf('navigation.play')).toBeGreaterThan(-1)
    expect(mobile.indexOf('navigation.play')).toBeLessThan(mobile.indexOf('navigation.discord'))
  })

  it('gives mobile group headers the typography and surface of the link rows', () => {
    expect(bar).toMatch(/NAV_ITEM_MOBILE,\s*isGroupActive\(item\)/)
    expect(bar).not.toContain('bg-surface-container-highest')
    expect(bar).not.toMatch(/mobileSummaryClass/)
  })

  it('switches to the mobile menu below xl', () => {
    expect(bar).toContain('hidden items-center gap-2 xl:flex')
    expect(bar).toContain('xl:hidden')
  })

  it('takes the events placement as a prop and does not know the events layer', () => {
    expect(bar).toMatch(/eventsTopLevel\??:\s*boolean/)
    expect(bar).toContain('buildNavConfig')
    expect(bar).not.toMatch(/layers\/events|#layers\/events|useEvents/)
  })

  it('has the layout decide the placement and hand it down', () => {
    expect(layout).toMatch(/<NavigationBar[^>]*:events-top-level="/)
  })
})
