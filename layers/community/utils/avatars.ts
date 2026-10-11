import { smallAvatarUrl } from '#shared/utils/liteSupporters'

const OPEN_COLLECTIVE_AVATAR_HOSTS = new Set([
  'opencollective-production.s3.us-west-1.amazonaws.com', 'images.opencollective.com'
])

/** 128px covers the 56px wall box at 2x. */
const WALL_AVATAR_SIZE = 128

/**
 * A supporter's avatar as the wall loads it. Open Collective avatars become
 * the sized render of the profile: the S3 original is too large, and the
 * resizer rejects that origin. Any other host passes through unchanged.
 */
export function supporterAvatarUrl(avatarUrl: string, profile: string | undefined): string | null {
  let host: string
  try {
    host = new URL(avatarUrl).hostname
  } catch {
    return null
  }
  if (!OPEN_COLLECTIVE_AVATAR_HOSTS.has(host)) return avatarUrl
  return profile ? smallAvatarUrl(profile, WALL_AVATAR_SIZE) : null
}
