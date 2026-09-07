type AnalyticsPayload = Record<string, unknown>

export function useAnalytics() {
  const { $clientPosthog } = useNuxtApp()

  const trackEvent = (event: string, properties: AnalyticsPayload = {}) => {
    if (!$clientPosthog) {
      return
    }
    try {
      $clientPosthog.capture(event, properties)
    } catch {
      // Fail silently in case PostHog is not initialised correctly
    }
  }

  const trackShare = (platform: string, payload: AnalyticsPayload) => {
    trackEvent('share_event', {
      platform,
      ...payload
    })
  }

  return {
    trackEvent,
    trackShare
  }
}

