import { computed, useNuxtApp, useState } from '#imports'
import type { ConsentState } from '../types'
import { consentCookieString, readConsentCookie } from '../utils/consentCookie'
import { createConsentController, isBannerVisible } from '../utils/consentController'

/**
 * Shared consent state for the banner, the footer link and PostHog. Client
 * only: the cookie is never read or written during SSR, because cached pages
 * must not vary by cookie or carry a Set-Cookie.
 */
export function useCookieConsent() {
  const nuxtApp = useNuxtApp()
  const state = useState<ConsentState | null>('cookie-consent', () => null)
  const bannerOpen = useState<boolean>('cookie-consent-banner', () => false)

  const controller = createConsentController({
    now: () => new Date(),
    getState: () => state.value,
    setState: (next) => {
      state.value = next
    },
    getBannerOpen: () => bannerOpen.value,
    setBannerOpen: (open) => {
      bannerOpen.value = open
    },
    persist: (next) => {
      document.cookie = consentCookieString(next, location.protocol === 'https:')
    },
    applyAnalytics: (allowed) => applyPostHog(nuxtApp.$clientPosthog, allowed),
  })

  return {
    decided: computed(() => state.value !== null),
    analyticsAllowed: computed(() => state.value?.analytics === true),
    bannerVisible: computed(() => isBannerVisible(state.value !== null, bannerOpen.value)),
    acceptAll: controller.acceptAll,
    rejectAll: controller.rejectAll,
    save: controller.save,
    reopen: controller.reopen,
    close: controller.close,
    /** Call once on client start (see plugins/cookie-consent.client.ts). */
    restore: () => {
      if (import.meta.client) controller.restore(readConsentCookie(document.cookie))
    },
  }
}

interface PostHogCapture {
  opt_in_capturing: () => void
  opt_out_capturing: () => void
}

function applyPostHog(client: PostHogCapture | null | undefined, allowed: boolean) {
  if (!client) return
  if (allowed) client.opt_in_capturing()
  else client.opt_out_capturing()
}
