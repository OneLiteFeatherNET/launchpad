import type { TeamMember } from '~/types/team'

/**
 * Source host for Minecraft head renders. Must be allow-listed in
 * `image.domains` (see `nuxt.config.ts`) so the Cloudflare Images
 * provider can transform/optimise the upstream PNG.
 */
const MC_HEADS_HOST = 'https://mc-heads.net/avatar'

/** Steve fallback for open positions and members without an MC identity. */
const FALLBACK_MC_NAME = 'Steve'

/**
 * Resolves the Minecraft username used to fetch a head render. Falls back
 * to the team slug because, for the OneLiteFeather roster, slugs equal the
 * MC name for the majority of entries. `mc-heads.net` returns the Steve
 * head for unknown names, which keeps the layout intact for the few slugs
 * that aren't valid usernames.
 */
export function mcUsernameOf(member: Pick<TeamMember, 'mcName' | 'slug'>): string {
  return member.mcName || member.slug || FALLBACK_MC_NAME
}

/**
 * Upstream avatar URL for a team member. The Nuxt Image Cloudflare
 * provider rewrites this through `img.onelitefeather.net/cdn-cgi/image/...`
 * so the browser receives AVIF/WebP at the requested size.
 *
 * `size` is the upstream render size in pixels. Pass the largest display
 * size needed; `NuxtImg`'s `sizes`/density handles smaller variants.
 */
export function teamAvatarUrl(
  member: Pick<TeamMember, 'mcName' | 'slug' | 'avatarUrl'>,
  size = 128
): string {
  if (member.avatarUrl) return member.avatarUrl
  return `${MC_HEADS_HOST}/${encodeURIComponent(mcUsernameOf(member))}/${size}`
}
