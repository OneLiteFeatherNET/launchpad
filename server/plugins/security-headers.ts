/**
 * Every response carries the baseline security headers, errors included.
 *
 * One `response` hook sees the final response whether a handler returned it or
 * the error handler built it. The headers are static, so they do not touch
 * edge caching, and nothing here reads the request.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('response', (res) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      res.headers.set(name, value)
    }
  })
})
