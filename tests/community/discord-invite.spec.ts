import { describe, expect, it, vi } from 'vitest'
import { loadDiscordMemberCount } from '../../shared/utils/discordInvite'

const respond = (body: unknown, init: ResponseInit = { status: 200 }) =>
  vi.fn(async () => new Response(JSON.stringify(body), init))

describe('loadDiscordMemberCount', () => {
  it('asks the public invite endpoint for counts, without a token', async () => {
    const fetcher = respond({ approximate_member_count: 42 })
    await loadDiscordMemberCount(fetcher, 'abc123')
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://discord.com/api/v10/invites/abc123?with_counts=true')
    expect(init.headers, 'no Authorization header').toBeUndefined()
  })

  it('url-encodes the invite code', async () => {
    const fetcher = respond({ approximate_member_count: 1 })
    await loadDiscordMemberCount(fetcher, 'a/b?c')
    expect(fetcher.mock.calls[0]![0]).toBe('https://discord.com/api/v10/invites/a%2Fb%3Fc?with_counts=true')
  })

  it('returns approximate_member_count', async () => {
    expect(await loadDiscordMemberCount(respond({ approximate_member_count: 1234 }), 'x')).toBe(1234)
  })

  it('hands the fetcher an abort signal so a slow Discord cannot hold the page', async () => {
    const fetcher = respond({ approximate_member_count: 1 })
    await loadDiscordMemberCount(fetcher, 'x')
    expect((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal).toBeInstanceOf(AbortSignal)
  })

  it('throws on an error status, so no cache layer stores it', async () => {
    const fetcher = respond({ message: 'Unknown Invite', code: 10006 }, { status: 404 })
    await expect(loadDiscordMemberCount(fetcher, 'x')).rejects.toThrow(/404/)
  })

  it('throws when the count is missing', async () => {
    await expect(loadDiscordMemberCount(respond({}), 'x')).rejects.toThrow(/member count/)
  })

  it('throws when the count is not a number', async () => {
    await expect(loadDiscordMemberCount(respond({ approximate_member_count: '12' }), 'x')).rejects.toThrow(/member count/)
  })

  it('throws when the body is not JSON', async () => {
    const fetcher = vi.fn(async () => new Response('<html>', { status: 200 }))
    await expect(loadDiscordMemberCount(fetcher, 'x')).rejects.toThrow()
  })

  it('lets a failing fetcher propagate', async () => {
    const fetcher = vi.fn(async () => { throw new Error('network down') })
    await expect(loadDiscordMemberCount(fetcher, 'x')).rejects.toThrow('network down')
  })
})
