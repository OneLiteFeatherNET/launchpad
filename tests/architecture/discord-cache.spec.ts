import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

const read = (file: string) => readFileSync(join(repoRoot, file), 'utf8')

describe('Discord member count', () => {
  it('comes from a cached server route that does not cache a failure', () => {
    const route = read('server/api/community/discord.get.ts')
    expect(route).toMatch(/defineCachedFunction/)
    expect(route).toMatch(/swr:\s*false/)
    expect(route).toMatch(/members:\s*null/)
  })

  it('reads its invite code from private runtime config with the current default', () => {
    expect(read('server/api/community/discord.get.ts')).toMatch(/useRuntimeConfig\(\)\.discordInviteCode/)
    expect(read('nuxt.config.ts')).toMatch(/discordInviteCode:\s*'yzkf2H9UQD'/)
  })

  it('is reached by the client only through the route, never by calling Discord', () => {
    const composable = read('layers/community/composables/useDiscordMembers.ts')
    expect(composable).toMatch(/\/api\/community\/discord/)
    expect(composable).not.toMatch(/discord\.com/)
  })
})
