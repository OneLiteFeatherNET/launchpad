import { describe, expect, it, vi } from 'vitest'
import { loadDiscordMembers, resolveDiscordInviteCode } from '../../shared/utils/discordInvite'

type Init = { signal?: AbortSignal, redirect?: string }

const redirectTo = (location: string | null, status = 302) =>
  new Response(null, { status, headers: location ? { location } : {} })

const routes = (table: Record<string, () => Response>) =>
  vi.fn(async (url: string, _init: Init): Promise<Response> => {
    const route = table[url]
    if (!route) throw new Error(`unexpected ${url}`)
    return route()
  })

const SHORT = 'https://1lf.link/discord'
const INVITE_URL = 'https://discord.com/api/v10/invites'

describe('resolveDiscordInviteCode', () => {
  it('asks the shortlink without following the redirect, with an abort signal', async () => {
    const fetcher = routes({ [SHORT]: () => redirectTo('https://discord.com/invite/abc') })
    await resolveDiscordInviteCode(fetcher, SHORT)
    const [url, init] = fetcher.mock.calls[0]!
    expect(url).toBe(SHORT)
    expect(init.redirect).toBe('manual')
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('reads the code from a discord.com invite', async () => {
    const fetcher = routes({ [SHORT]: () => redirectTo('https://discord.com/invite/abc123') })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBe('abc123')
  })

  it('reads the code from a discord.gg invite', async () => {
    const fetcher = routes({ [SHORT]: () => redirectTo('https://discord.gg/xyz') })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBe('xyz')
  })

  it('resolves a relative Location against the requested URL', async () => {
    const fetcher = routes({
      [SHORT]: () => redirectTo('/d2'),
      'https://1lf.link/d2': () => redirectTo('https://discord.com/invite/rel')
    })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBe('rel')
  })

  it('follows at most three hops', async () => {
    const fetcher = routes({
      [SHORT]: () => redirectTo('https://a.example/1'),
      'https://a.example/1': () => redirectTo('https://a.example/2'),
      'https://a.example/2': () => redirectTo('https://a.example/3'),
      'https://a.example/3': () => redirectTo('https://discord.com/invite/late')
    })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('gives null without a Location', async () => {
    expect(await resolveDiscordInviteCode(routes({ [SHORT]: () => redirectTo(null) }), SHORT)).toBeNull()
  })

  it('gives null for a foreign host that does not redirect on', async () => {
    const fetcher = routes({
      [SHORT]: () => redirectTo('https://evil.example/invite/abc'),
      'https://evil.example/invite/abc': () => new Response('ok', { status: 200 })
    })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBeNull()
  })

  it('gives null when the shortlink does not redirect', async () => {
    const fetcher = routes({ [SHORT]: () => new Response('ok', { status: 200 }) })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBeNull()
  })

  it('gives null when a Discord URL carries no code', async () => {
    const fetcher = routes({ [SHORT]: () => redirectTo('https://discord.com/') })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBeNull()
  })

  it('gives null when the fetcher throws', async () => {
    const fetcher = vi.fn(async (_url: string, _init: Init): Promise<Response> => {
      throw new Error('network down')
    })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBeNull()
  })

  it('gives null for a redirect loop', async () => {
    const fetcher = routes({ [SHORT]: () => redirectTo(SHORT) })
    expect(await resolveDiscordInviteCode(fetcher, SHORT)).toBeNull()
  })
})

describe('loadDiscordMembers', () => {
  const countUrl = (code: string) => `${INVITE_URL}/${code}?with_counts=true`
  const options = { shortlink: SHORT, fallbackCode: 'fallback' }

  it('counts with the code the shortlink points to', async () => {
    const fetcher = routes({
      [SHORT]: () => redirectTo('https://discord.com/invite/fresh'),
      [countUrl('fresh')]: () => Response.json({ approximate_member_count: 7 })
    })
    expect(await loadDiscordMembers(fetcher, options)).toBe(7)
  })

  it('counts with the configured code when the shortlink gives none', async () => {
    const fetcher = routes({
      [SHORT]: () => redirectTo(null),
      [countUrl('fallback')]: () => Response.json({ approximate_member_count: 9 })
    })
    expect(await loadDiscordMembers(fetcher, options)).toBe(9)
  })

  it('throws when the count cannot be had, so no cache layer stores it', async () => {
    const fetcher = routes({
      [SHORT]: () => redirectTo('https://discord.com/invite/fresh'),
      [countUrl('fresh')]: () => new Response('nope', { status: 404 })
    })
    await expect(loadDiscordMembers(fetcher, options)).rejects.toThrow(/404/)
  })
})
