// Runs after nuxt-posthog's plugin, which creates $clientPosthog. Opting out here
// silences pageview, autocapture, pageleave and recording on every non-production host.
export default defineNuxtPlugin({
  name: 'posthog-production-gate',
  dependsOn: ['posthog'],
  setup() {
    const { $clientPosthog } = useNuxtApp()
    if (!$clientPosthog) return
    const production = productionHostname(useRuntimeConfig().public.siteUrl)
    if (!isAnalyticsHost(window.location.hostname, production)) $clientPosthog.opt_out_capturing()
  },
})
