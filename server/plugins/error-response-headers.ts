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
 * One hook, Nitro's `response`: it sees the final response whether a handler
 * returned an error status or threw and the error handler built it.
 *
 * Cloudflare's own error pages (1101, 1102) are produced outside the Worker
 * and can carry no header from here.
 */
const markError = (headers: Headers) => {
  headers.set('X-Robots-Tag', 'noindex')
  headers.set('cloudflare-cdn-cache-control', 'no-store')
  headers.set('Cache-Control', 'no-store')
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('response', (res) => {
    if (res.status >= 400) markError(res.headers)
  })
})
