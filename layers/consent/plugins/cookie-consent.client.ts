// Applies the choice stored by an earlier visit. Runs after nuxt-posthog's
// `enforce: 'pre'` plugin, so $clientPosthog already exists here.
export default defineNuxtPlugin(() => {
  useCookieConsent().restore()
})
