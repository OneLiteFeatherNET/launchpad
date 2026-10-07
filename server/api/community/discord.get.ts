// Same caching shape as opencollective.get.ts: swr is off (a background refresh
// needs waitUntil) and a throw is never stored.
const cachedMembers = defineCachedFunction(
  (code: string) => loadDiscordMemberCount(fetch, code),
  { name: 'discord-members', maxAge: DISCORD_CACHE_TTL, swr: false, getKey: (code: string) => code }
)

export default defineEventHandler(async (): Promise<{ members: number | null }> => {
  const code = String(useRuntimeConfig().discordInviteCode)
  try {
    return { members: await cachedMembers(code) }
  } catch (err) {
    console.warn('[discord] failed to load member count', err)
    return { members: null }
  }
})
