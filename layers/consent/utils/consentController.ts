import type { ConsentState } from '../types'

/**
 * The ports the controller acts through. The composable supplies the real
 * ones (useState, document.cookie, PostHog); tests supply recording fakes and
 * a fixed clock, so the rules run without Nuxt, a browser or wall-clock time.
 */
export interface ConsentPorts {
  now: () => Date
  setState: (state: ConsentState) => void
  setBannerOpen: (open: boolean) => void
  persist: (state: ConsentState) => void
  applyAnalytics: (allowed: boolean) => void
  /** False off the production host: a stored opt-in must never switch capture on there. */
  analyticsHost: boolean
}

export function createConsentController(ports: ConsentPorts) {
  const applyAnalytics = (allowed: boolean) => ports.applyAnalytics(allowed && ports.analyticsHost)

  // A decision always closes the banner, including one reopened from the footer.
  function decide(analytics: boolean) {
    const state: ConsentState = { analytics, decidedAt: ports.now().toISOString() }
    ports.setState(state)
    ports.persist(state)
    applyAnalytics(analytics)
    ports.setBannerOpen(false)
  }

  return {
    acceptAll: () => decide(true),
    rejectAll: () => decide(false),
    save: ({ analytics }: { analytics: boolean }) => decide(analytics),
    reopen: () => ports.setBannerOpen(true),
    /** Applies a choice stored by an earlier visit. Does not write the cookie again. */
    restore(stored: ConsentState | null) {
      if (!stored) return
      ports.setState(stored)
      applyAnalytics(stored.analytics)
    },
  }
}

/** Statistics run until a visitor opts out, so no decision also means allowed. */
export function analyticsAllowed(state: ConsentState | null): boolean {
  return state?.analytics ?? true
}

/** The banner shows until a decision exists, and again whenever it is reopened. */
export function isBannerVisible(decided: boolean, bannerOpen: boolean): boolean {
  return !decided || bannerOpen
}
