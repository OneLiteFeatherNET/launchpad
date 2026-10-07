/** Seconds both the Nitro cache and Cloudflare's subrequest cache keep a successful count. */
export const DISCORD_CACHE_TTL = 3600

type Init = { cf?: Record<string, unknown>, signal?: AbortSignal, redirect?: 'manual' }
type Fetcher = (url: string, init: Init) => Promise<Response>

/**
 * The server's approximate member count, from Discord's public invite
 * endpoint (no token). Throws on every failure so a cache layer never stores
 * one; the caller decides what the page shows instead.
 */
export async function loadDiscordMemberCount(
  fetcher: Fetcher,
  inviteCode: string
): Promise<number> {
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

const DISCORD_HOSTS = new Set(['discord.com', 'www.discord.com', 'discord.gg', 'discordapp.com'])
const MAX_REDIRECT_HOPS = 3

/**
 * The invite code a shortlink currently points to, read from the `Location`
 * of its redirect chain without following it. `null` when nothing usable
 * comes back; never throws.
 */
export async function resolveDiscordInviteCode(
  fetcher: Fetcher,
  shortlink: string
): Promise<string | null> {
  let url = shortlink
  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
    let location: string | null
    try {
      const res = await fetcher(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) })
      location = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null
    } catch {
      return null
    }
    if (!location) return null
    let next: URL
    try {
      next = new URL(location, url)
    } catch {
      return null
    }
    if (DISCORD_HOSTS.has(next.hostname)) {
      const code = next.pathname.split('/').filter(Boolean).pop()
      return code && code !== 'invite' ? code : null
    }
    url = next.href
  }
  return null
}

/**
 * Member count for the invite behind `shortlink`, counting with
 * `fallbackCode` when the shortlink cannot be resolved. Throws when the count
 * itself cannot be had.
 */
export async function loadDiscordMembers(
  fetcher: Fetcher,
  options: { shortlink: string, fallbackCode: string }
): Promise<number> {
  const code = await resolveDiscordInviteCode(fetcher, options.shortlink)
  return loadDiscordMemberCount(fetcher, code ?? options.fallbackCode)
}
