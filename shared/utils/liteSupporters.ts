import type { LiteSupporter } from '../../layers/opencollective/types'

/** Seconds both the Nitro cache and Cloudflare's subrequest cache keep a successful list. */
export const LITE_SUPPORTERS_CACHE_TTL = 3600

type Init = { cf: Record<string, unknown>, signal?: AbortSignal }
type Fetcher = (url: string, init: Init) => Promise<Response>

type Member = {
  name?: unknown
  image?: unknown
  profile?: unknown
  role?: unknown
  isActive?: unknown
}

const AVATAR_HOSTS = new Set([
  'opencollective-production.s3.us-west-1.amazonaws.com', 'images.opencollective.com'
])
const ANONYMOUS = new Set(['guest',
'incognito',
'anonymous'])
const PROFILE_HOSTS = new Set(['opencollective.com', 'www.opencollective.com'])

const parseUrl = (value: unknown): URL | null => {
  if (typeof value !== 'string') return null
  try {
    return new URL(value)
  } catch {
    return null
  }
}

const profileOf = (value: unknown): string | null => {
  const url = parseUrl(value)
  return url && url.protocol === 'https:' && PROFILE_HOSTS.has(url.hostname) ? url.href : null
}

const avatarOf = (value: unknown): string | null => {
  const url = parseUrl(value)
  return url && url.protocol === 'https:' && AVATAR_HOSTS.has(url.hostname) ? url.href : null
}

/**
 * Active backers of the collective from its public member list, cut down to
 * name, avatar and profile: amounts, e-mail addresses and every other field
 * are dropped here and never leave the server. Throws on any failure so a
 * cache layer never stores one; the caller decides the fallback.
 */
export async function loadLiteSupporters(
  fetcher: Fetcher,
  options: { slug: string }
): Promise<LiteSupporter[]> {
  const res = await fetcher(
    `https://opencollective.com/${encodeURIComponent(options.slug)}/members/all.json`,
    {
      signal: AbortSignal.timeout(5000),
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: { '200-299': LITE_SUPPORTERS_CACHE_TTL, '300-599': 0 }
      }
    }
  )
  if (!res.ok) throw new Error(`OpenCollective responded ${res.status}`)
  const body: unknown = await res.json()
  if (!Array.isArray(body)) throw new Error('OpenCollective members are not a list')

  const collective = options.slug.trim().toLowerCase()
  const collectiveProfile = profileOf(`https://opencollective.com/${encodeURIComponent(options.slug)}`)
  const seen = new Set<string>()
  const supporters: LiteSupporter[] = []

  for (const entry of body as Member[]) {
    if (entry?.role !== 'BACKER' || entry.isActive !== true) continue
    const profile = profileOf(entry.profile)
    const name = typeof entry.name === 'string' ? entry.name.trim() : ''
    if (!profile || !name || seen.has(profile)) continue
    const lowered = name.toLowerCase()
    if (lowered === collective || profile === collectiveProfile || ANONYMOUS.has(lowered)) continue
    seen.add(profile)
    supporters.push({ name, image: avatarOf(entry.image), profile })
  }

  return supporters.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
}
