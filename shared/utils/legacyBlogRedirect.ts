/**
 * Target for a blog URL without locale prefix, or null when none applies.
 * `/blog/<locale>/<post>` came from old sitemaps and moves to `/<locale>/blog/<post>`.
 * Not a routeRule: @nuxtjs/sitemap drops `/en/blog` when `/blog` redirects.
 */
export function legacyBlogRedirectTarget(path: string): string | null {
  const localePrefixed = /^\/blog\/(en|de)(?=[/?]|$)/.exec(path)
  if (localePrefixed) return `/${localePrefixed[1]}/blog${path.slice(localePrefixed[0].length)}`
  return /^\/blog(?=[/?]|$)/.test(path) ? `/en${path}` : null
}
