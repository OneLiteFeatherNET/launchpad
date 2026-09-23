/**
 * Cacheable responses carry no cookies.
 *
 * Every server render under /en and /de used to set two cookies:
 * `i18n_redirected` (@nuxtjs/i18n remembering the locale) and `ph-identify`
 * (nuxt-posthog, always empty on the server). Cloudflare's Workers Cache
 * refuses to store any response with `Set-Cookie` — and if it did store one,
 * every later visitor would receive the first visitor's cookies.
 *
 * Neither cookie needs the server:
 * - `i18n_redirected` only matters on `/`, which redirects by it and is never
 *   cached (nuxt.config.ts routeRules); that response keeps its cookie. On
 *   the content pages the client-side i18n plugin writes it itself when the
 *   visitor switches language.
 * - `ph-identify` holds nothing until a visitor opts into analytics, which
 *   happens in the browser.
 *
 * Only successful responses are touched: errors are never cached anyway
 * (server/plugins/error-response-headers.ts).
 */
const CACHEABLE = /^\/(?:(?:en|de)(?:\/|$)|robots\.txt$)/

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (getResponseStatus(event) !== 200) return
    if (!CACHEABLE.test(event.path.split('?')[0]!)) return
    removeResponseHeader(event, 'set-cookie')
  })
})
