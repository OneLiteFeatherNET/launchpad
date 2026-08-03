import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * Pressing Escape with the mobile menu open removes the `<nav>` from the DOM
 * while focus is inside it. The browser has nowhere to put focus, so it falls
 * to `<body>` — a keyboard user loses their position entirely and starts
 * tabbing from the top of the page.
 *
 * The fix is the smaller half of what the finding proposes, and deliberately
 * so. This menu is a **disclosure**, not a modal dialog: the toggle carries
 * `aria-expanded` and `aria-controls`, the panel is a labelled `role=
 * "navigation"`. The WAI-ARIA APG does not ask for a focus trap in that
 * pattern, and `inert`-ing the page behind it is a decision about whether the
 * overlay is meant to be modal — not a defect. What is a defect is dropping
 * focus on the floor.
 *
 * So: when the menu closes and focus was inside it, focus returns to the
 * button that opened it. `LanguageSelector` already does exactly this, and the
 * containment check is why a route change closing the menu does not yank focus
 * away from wherever the user actually is.
 *
 * Not covered here: whether the browser really moves focus. That needs a real
 * one, and this component wants a Nuxt runtime to mount. The check below holds
 * the wiring in place; it does not claim to have watched it work.
 */

const NAVBAR = 'components/features/navigation/NavigationBar.vue'

function navbar(): string {
  return readFileSync(`${repoRoot}/${NAVBAR}`, 'utf8')
}

describe('mobile menu focus', () => {
  it('keeps a handle on the toggle and the panel', () => {
    const source = navbar()
    // Without refs there is nothing to return focus to, and no way to know
    // whether focus is inside the panel.
    expect(source).toMatch(/ref="mobileToggleRef"/)
    expect(source).toMatch(/ref="mobileMenuRef"/)
    expect(source).toMatch(/const mobileToggleRef = ref/)
    expect(source).toMatch(/const mobileMenuRef = ref/)
  })

  it('returns focus to the toggle when closing', () => {
    const closeMenus = /const closeMenus = \(\) => \{[\s\S]*?\n\}/.exec(navbar())?.[0]
    expect(closeMenus).toBeDefined()
    expect(closeMenus).toContain('focus()')
    expect(closeMenus).toContain('mobileToggleRef')
  })

  it('only does so when focus was inside the panel', () => {
    const closeMenus = /const closeMenus = \(\) => \{[\s\S]*?\n\}/.exec(navbar())?.[0]
    // A route change also closes the menu. Moving focus then would take it
    // from wherever the user landed.
    expect(closeMenus).toContain('contains(document.activeElement)')
  })

  it('is what Escape goes through', () => {
    // The path that exposed the bug must not bypass the restoration.
    expect(navbar()).toMatch(/onKeyStroke\('Escape',\s*\(\) => closeMenus\(\)\)/)
  })
})
