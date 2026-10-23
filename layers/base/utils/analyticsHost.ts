/** Production hostname. Undefined off production: only the production build sets siteUrl. */
export function productionHostname(siteUrl: string | undefined): string | undefined {
  if (!siteUrl) return undefined
  try {
    return new URL(siteUrl).hostname
  } catch {
    return undefined
  }
}

/** PostHog captures only on the production host; localhost and previews stay silent. */
export function isAnalyticsHost(hostname: string, productionHost: string | undefined): boolean {
  return !!productionHost && hostname === productionHost
}
