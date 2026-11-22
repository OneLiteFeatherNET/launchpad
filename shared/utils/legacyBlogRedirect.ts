/**
 * Target for a blog URL without locale prefix, or null when none applies.
 * Not a routeRule: @nuxtjs/sitemap drops `/en/blog` when `/blog` redirects.
 */
export function legacyBlogRedirectTarget(path: string): string | null {
  return /^\/blog(?=[/?]|$)/.test(path) ? `/en${path}` : null
}
