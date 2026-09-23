import { describe, expect, it } from 'vitest'
import * as nav from '../../layers/navigation/utils/navItemClasses'
import { schemeColors } from '../helpers/theme'

/**
 * A navigation item combines a structure class with exactly one colour state.
 * Two text colours on one element are settled by stylesheet order, not by
 * class order — which is how the active item once rendered in the resting
 * on-surface-variant instead of on-secondary-container.
 */

const roles = new Set(schemeColors().keys())

/** The colour roles a class list sets as text colour. */
function textColours(classes: string): string[] {
  return classes.split(/\s+/)
    .map((token) => /^text-([a-z-]+)$/.exec(token)?.[1])
    .filter((name): name is string => name !== undefined && roles.has(name))
}

describe('navigation item classes', () => {
  it.each([
    'NAV_ITEM_DESKTOP',
    'NAV_ITEM_MOBILE',
    'NAV_ITEM_BOTTOM',
  ] as const)('%s carries no text colour of its own', (name) => {
    expect(textColours(nav[name])).toEqual([])
  })

  it('gives the resting and the active state exactly one text colour each', () => {
    expect(textColours(nav.NAV_ITEM_INACTIVE)).toEqual(['on-surface-variant'])
    expect(textColours(nav.NAV_ITEM_ACTIVE)).toEqual(['on-secondary-container'])
  })
})
