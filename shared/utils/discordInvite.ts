/** Seconds both the Nitro cache and Cloudflare's subrequest cache keep a successful count. */
export const DISCORD_CACHE_TTL = 3600

type Init = { cf: Record<string, unknown>, signal?: AbortSignal }
type Fetcher = (url: string, init: Init) => Promise<Response>

/**
 * The server's approximate member count, from Discord's public invite
 * endpoint (no token). Throws on every failure so a cache layer never stores
 * one; the caller decides what the page shows instead.
 */
export async function loadDiscordMemberCount(fetcher: Fetcher, inviteCode: string): Promise<number> {
  const res = await fetcher(
    `https://discord.com/api/v10/invites/${encodeURIComponent(inviteCode)}?with_counts=true`,
    {
      signal: AbortSignal.timeout(5000),
      // Only honoured by the Workers runtime; shared by every isolate in the colo.
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: { '200-299': DISCORD_CACHE_TTL, '300-599': 0 }
      }
    }
  )
  if (!res.ok) throw new Error(`Discord responded ${res.status}`)
  const body = (await res.json()) as { approximate_member_count?: unknown }
  const count = body.approximate_member_count
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    throw new Error('Discord invite carries no member count')
  }
  return count
}
