import type { H3Event } from 'h3'

/**
 * Keeps server errors out of search indexes.
 *
 * @nuxtjs/robots sets `X-Robots-Tag: index, follow` in a middleware, before
 * anything has rendered — so when the render then fails, the 500 goes out
 * still announcing itself as indexable. That is what production served for
 * every "Cannot redefine property: $i18n" failure.
 *
 * Two hooks, because a 5xx reaches the client by two routes: a thrown error
 * runs through Nitro's `error` hook and the error handler, and never through
 * `beforeResponse`; a handler that sets a 5xx status and returns normally
 * runs through `beforeResponse` only. The `error` hook fires before the error
 * handler writes its response, so a header set there is still sent.
 *
 * Cloudflare's own error pages (1101, 1102) are produced outside the Worker
 * and can carry no header from here.
 */
const markNotIndexable = (event: H3Event) => {
  setResponseHeader(event, 'X-Robots-Tag', 'noindex')
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500
    if (event && status >= 500) markNotIndexable(event)
  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (getResponseStatus(event) >= 500) markNotIndexable(event)
  })
})
