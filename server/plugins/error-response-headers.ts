import type { H3Event } from 'h3'

/**
 * Error responses are neither indexed nor cached.
 *
 * Indexing: @nuxtjs/robots sets `X-Robots-Tag: index, follow` in a
 * middleware, before anything has rendered — so when the render then fails,
 * the error goes out still announcing itself as indexable. That is what
 * production served for every "Cannot redefine property: $i18n" failure, and
 * for every 404.
 *
 * Caching: the route rules in nuxt.config.ts attach an edge-cache directive
 * to every page under /en and /de before the handler runs, and without any
 * directive Cloudflare's Workers Cache keeps a 404 for three minutes anyway.
 * A cached 404 would hide an article for the whole cache lifetime after its
 * `releaseDate`, so errors get an explicit `no-store` for the edge and for
 * browsers.
 *
 * Two hooks, because an error reaches the client by two routes: a thrown
 * error runs through Nitro's `error` hook and the error handler, and never
 * through `beforeResponse`; a handler that sets an error status and returns
 * normally runs through `beforeResponse` only. The `error` hook fires before
 * the error handler writes its response, so headers set there are still sent.
 *
 * Cloudflare's own error pages (1101, 1102) are produced outside the Worker
 * and can carry no header from here.
 */
const markError = (event: H3Event) => {
  setResponseHeader(event, 'X-Robots-Tag', 'noindex')
  setResponseHeader(event, 'cloudflare-cdn-cache-control', 'no-store')
  setResponseHeader(event, 'Cache-Control', 'no-store')
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500
    if (event && status >= 400) markError(event)
  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (getResponseStatus(event) >= 400) markError(event)
  })
})
