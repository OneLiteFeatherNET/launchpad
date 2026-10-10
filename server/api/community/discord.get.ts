// Same caching shape as opencollective.get.ts: swr is off (a background refresh
// needs waitUntil) and a throw is never stored.
const cachedMembers = defineCachedFunction(
  (shortlink: string, fallbackCode: string) => {
    return loadDiscordMembers(fetch, { shortlink, fallbackCode })
  },
  {
    name: 'discord-members',
    maxAge: DISCORD_CACHE_TTL,
    swr: false,
    getKey: (shortlink: string, fallbackCode: string) => `${shortlink}|${fallbackCode}`
  }
)

export default defineEventHandler(async (): Promise<{ members: number | null }> => {
  const config = useRuntimeConfig()
  // The shortlink's current target wins; the configured code only covers a failed lookup.
  const shortlink = String(config.public.discordUrl)
  const fallbackCode = String(config.discordInviteCode)
  try {
    return { members: await cachedMembers(shortlink, fallbackCode) }
  } catch (err) {
    console.warn('[discord] failed to load member count', err)
    return { members: null }
  }
})
