// `#sitemap` is aliased to @nuxtjs/sitemap's runtime dir by the module
// (nitro.alias["#sitemap"]). This is the same entrypoint the module's own
// route handler uses internally.
// @ts-expect-error - internal runtime entrypoint, no published types
import { sitemapChildXmlEventHandler } from '#sitemap/server/sitemap/event-handlers.js'

/**
 * Compatibility shim for @nuxtjs/sitemap@7.6.0 running on the h3 version
 * shipped with nuxt@4.4.5.
 *
 * In this h3 release the request path (`event.path`, derived from
 * `node.req.url` / the per-layer `_path`) keeps the query string attached
 * (e.g. `/__sitemap__/de-DE.xml?mockProductionEnv`). The sitemap module's
 * child-sitemap handler bails out immediately with:
 *
 *   if (!e.path.endsWith(".xml")) return
 *
 * so as soon as a query string is present (the SEO gate always appends
 * `?mockProductionEnv`) the handler returns `undefined` and Nitro replies
 * `204 No Content`. The per-locale sitemaps therefore came back empty after
 * the upgrade and the indexable routes vanished from the sitemap.
 *
 * h3 recomputes the layered `_path` per route layer from the original URL,
 * so a `server/middleware` shim cannot fix this (its mutation is overwritten
 * before the sitemap route runs). Instead we override the child-sitemap
 * route itself: this file-based route takes precedence over the module's
 * `addServerHandler` route, and because it is the terminal handler we can
 * strip the query string from the event path immediately before delegating
 * to the module's original handler (no intervening h3 layer reverts it).
 *
 * The query carries no data the sitemap builder needs: it gates URLs through
 * `getPathRobotConfig(event, { skipSiteIndexable: true })`, which ignores the
 * site-level `?mockProductionEnv` toggle, so dropping the query here is safe.
 */
export default defineEventHandler((event) => {
  const stripQuery = (value: string | undefined) => {
    if (!value) return value
    const q = value.indexOf('?')
    return q === -1 ? value : value.slice(0, q)
  }

  if (event.node.req.url) {
    event.node.req.url = stripQuery(event.node.req.url)!
  }
  // `_path` backs the read-only `event.path` getter in this h3 version.
  const internal = event as unknown as { _path?: string }
  if (typeof internal._path === 'string') {
    internal._path = stripQuery(internal._path)!
  }

  return sitemapChildXmlEventHandler(event)
})
