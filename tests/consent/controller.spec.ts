import { describe, expect, it } from 'vitest'
import type { ConsentState } from '../../layers/consent/types'
import { analyticsAllowed, createConsentController, isBannerVisible } from '../../layers/consent/utils/consentController'

const NOW = new Date('2026-10-10T12:00:00.000Z')
const NOW_ISO = NOW.toISOString()
const STORED_OFF: ConsentState = { analytics: false, decidedAt: '2026-01-01T00:00:00.000Z' }

/** A fresh controller with recording ports; every test builds its own. */
function fixture(initial: ConsentState | null = null) {
  const persisted: ConsentState[] = []
  const analytics: boolean[] = []
  const world = { state: initial, bannerOpen: false }
  const controller = createConsentController({
    now: () => NOW,
    setState: (state) => { world.state = state },
    setBannerOpen: (open) => { world.bannerOpen = open },
    persist: (state) => { persisted.push(state) },
    applyAnalytics: (allowed) => { analytics.push(allowed) },
  })
  const bannerVisible = () => isBannerVisible(world.state !== null, world.bannerOpen)
  return { controller, world, persisted, analytics, bannerVisible }
}

describe('statistics default', () => {
  it('counts statistics as allowed while no decision is stored', () => {
    expect(analyticsAllowed(null)).toBe(true)
  })

  it('follows a stored opt-out', () => {
    expect(analyticsAllowed(STORED_OFF)).toBe(false)
  })
})

describe('consent controller', () => {
  it('stores an accepted choice with the injected decision time', () => {
    const { controller, persisted } = fixture()
    controller.acceptAll()
    expect(persisted).toEqual([{ analytics: true, decidedAt: NOW_ISO }])
  })

  it('opts PostHog in when all cookies are accepted', () => {
    const { controller, analytics } = fixture()
    controller.acceptAll()
    expect(analytics).toEqual([true])
  })

  it('stores a rejected choice as analytics refused', () => {
    const { controller, persisted } = fixture()
    controller.rejectAll()
    expect(persisted).toEqual([{ analytics: false, decidedAt: NOW_ISO }])
  })

  it('opts PostHog out when statistics are rejected', () => {
    const { controller, analytics } = fixture()
    controller.rejectAll()
    expect(analytics).toEqual([false])
  })

  it('applies the analytics choice made in the settings', () => {
    const { controller, analytics } = fixture()
    controller.save({ analytics: false })
    expect(analytics).toEqual([false])
  })

  it('stores the choice made in the settings', () => {
    const { controller, persisted } = fixture()
    controller.save({ analytics: false })
    expect(persisted).toEqual([{ analytics: false, decidedAt: NOW_ISO }])
  })

  it('keeps the decision in state after saving', () => {
    const { controller, world } = fixture()
    controller.acceptAll()
    expect(world.state).toEqual({ analytics: true, decidedAt: NOW_ISO })
  })

  it('shows the banner when no decision is stored', () => {
    expect(isBannerVisible(false, false)).toBe(true)
  })

  it('hides the banner once a decision is stored', () => {
    const { controller, bannerVisible } = fixture()
    controller.rejectAll()
    expect(bannerVisible()).toBe(false)
  })

  it('applies a stored choice on start without writing the cookie again', () => {
    const { controller, analytics, persisted, world } = fixture()
    controller.restore(STORED_OFF)
    expect(analytics).toEqual([false])
    expect(persisted).toEqual([])
    expect(world.state).toEqual(STORED_OFF)
  })

  it('leaves PostHog untouched on start when nothing is stored', () => {
    const { controller, analytics } = fixture()
    controller.restore(null)
    expect(analytics).toEqual([])
  })

  it('reopens the banner after a decision', () => {
    const { controller, bannerVisible } = fixture(STORED_OFF)
    controller.reopen()
    expect(bannerVisible()).toBe(true)
  })

  it('closes the reopened banner once the choice is saved', () => {
    const { controller, world, bannerVisible } = fixture(STORED_OFF)
    controller.reopen()
    controller.acceptAll()
    expect(world.bannerOpen).toBe(false)
    expect(bannerVisible()).toBe(false)
  })
})
