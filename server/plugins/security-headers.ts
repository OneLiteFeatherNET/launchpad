import type { H3Event } from 'h3'

/**
 * Every response carries the baseline security headers, errors included.
 *
 * Two hooks for the same reason as error-response-headers.ts: a thrown error
 * never reaches `beforeResponse`, and a handler that returns an error status
 * normally reaches nothing else. The headers are static, so they do not touch
 * edge caching, and nothing here reads the request.
 */
const apply = (event: H3Event) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    setResponseHeader(event, name, value)
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (_error, { event }) => {
    if (event) apply(event)
  })
  nitroApp.hooks.hook('beforeResponse', apply)
})
