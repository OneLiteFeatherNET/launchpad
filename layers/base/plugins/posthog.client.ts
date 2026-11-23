// Replaces nuxt-posthog's client plugin (see nuxt.config.ts) so posthog-js stays out of the
// entry chunk: it loads on idle time after hydration, and calls made before are queued.
export default defineNuxtPlugin({
  name: 'posthog',
  enforce: 'pre',
  setup(nuxtApp): { provide: { clientPosthog: LazyPostHog | null } } {
    const config = useRuntimeConfig().public.posthog
    if (config.disabled) return { provide: { clientPosthog: null } }

    const { client, attach } = createLazyPostHog()
    const flags = useState<Record<string, unknown>>('ph-feature-flags')
    const payloads = useState<Record<string, unknown>>('ph-feature-flag-payloads')

    if (config.capturePageViews) {
      useRouter().afterEach(to => client.capture('$pageview', { current_url: to.fullPath }))
    }

    const load = async () => {
      const { posthog } = await import('posthog-js')
      const options: Record<string, unknown> = {
        api_host: config.host,
        capture_pageview: false,
        capture_pageleave: !!config.capturePageLeaves,
        bootstrap: { featureFlags: flags.value, featureFlagPayloads: payloads.value },
        ...config.clientOptions,
      }
      if (config.proxy && config.host) {
        options.ui_host = `https://${new URL(config.host).hostname.split('.')[0]}.posthog.com`
        options.api_host = `${window.location.origin}/ingest/ph`
      }
      const instance = posthog.init(config.publicKey, options)
      if (!instance) return
      document.cookie = `ph-identify=${encodeURIComponent(instance.get_distinct_id())}; Path=/`
      instance.onFeatureFlags((active, featureFlags) => {
        flags.value = featureFlags
        const entries = active.map(flag => [flag, instance.getFeatureFlagPayload(flag)])
        payloads.value = Object.fromEntries(entries)
      })
      attach(instance)
    }

    nuxtApp.hook('app:mounted', () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(load, { timeout: 3000 })
      else setTimeout(load, 1500)
    })

    return { provide: { clientPosthog: client } }
  },
})
