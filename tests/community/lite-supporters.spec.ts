import { describe, expect, it, vi } from 'vitest'
import { loadLiteSupporters, smallAvatarUrl } from '../../shared/utils/liteSupporters'

type Init = { signal?: AbortSignal, headers?: unknown, cf?: Record<string, unknown> }

const S3 = 'https://opencollective-production.s3.us-west-1.amazonaws.com/account-avatar/x/a.png'
const SMALL_MARC = 'https://images.opencollective.com/marc44/avatar/96.png'

const member = (over: Record<string, unknown> = {}) => ({
  name: 'Marc',
  image: null,
  profile: 'https://opencollective.com/marc44',
  role: 'BACKER',
  isActive: true,
  totalAmountDonated: 4200,
  email: 'marc@example.org',
  github: 'https://github.com/marc',
  twitter: 'https://twitter.com/marc',
  website: 'https://marc.example',
  lastTransactionAt: '2026-09-01 10:00',
  createdAt: '2025-01-01 10:00',
  tier: 'Lite',
  ...over
})

const respond = (body: unknown, init: ResponseInit = { status: 200 }) => {
  return vi.fn(async (_url: string, _init: Init) => new Response(JSON.stringify(body), init))
}

const load = (members: unknown[], slug = 'onelitefeather') => loadLiteSupporters(respond(members), { slug })

describe('smallAvatarUrl', () => {
  it('points at the 96px avatar of the account behind the profile', () => {
    expect(smallAvatarUrl('https://opencollective.com/themeinerlp')).toBe('https://images.opencollective.com/themeinerlp/avatar/96.png')
  })

  it('ignores a trailing slash on the profile', () => {
    expect(smallAvatarUrl('https://opencollective.com/weltspielt/')).toBe('https://images.opencollective.com/weltspielt/avatar/96.png')
  })

  it('has no account to point at for a bare host', () => {
    expect(smallAvatarUrl('https://opencollective.com/')).toBeNull()
  })
})

describe('loadLiteSupporters', () => {
  it('asks the public members endpoint without a token', async () => {
    const fetcher = respond([])
    await loadLiteSupporters(fetcher, { slug: 'onelitefeather' })
    const [url, init] = fetcher.mock.calls[0]!
    expect(url).toBe('https://opencollective.com/onelitefeather/members/all.json')
    expect(init.headers, 'no Authorization header').toBeUndefined()
  })

  it('url-encodes the slug', async () => {
    const fetcher = respond([])
    await loadLiteSupporters(fetcher, { slug: 'a/b?c' })
    expect(fetcher.mock.calls[0]![0]).toBe('https://opencollective.com/a%2Fb%3Fc/members/all.json')
  })

  it('hands the fetcher an abort signal and cache hints', async () => {
    const fetcher = respond([])
    await loadLiteSupporters(fetcher, { slug: 'x' })
    const init = fetcher.mock.calls[0]![1]
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(init.cf?.cacheEverything).toBe(true)
  })

  it('keeps only active backers', async () => {
    const result = await load([
      member({ name: 'Ada', profile: 'https://opencollective.com/ada' }),
      member({ name: 'Admin', role: 'ADMIN', profile: 'https://opencollective.com/admin' }),
      member({ name: 'Host', role: 'HOST', profile: 'https://opencollective.com/host' }),
      member({ name: 'Con', role: 'CONTRIBUTOR', profile: 'https://opencollective.com/con' }),
      member({ name: 'Fol', role: 'FOLLOWER', profile: 'https://opencollective.com/fol' }),
      member({ name: 'Gone', isActive: false, profile: 'https://opencollective.com/gone' })
    ])
    expect(result.map((s) => s.name)).toEqual(['Ada'])
  })

  it('leaves out the collective itself by name and by profile', async () => {
    const result = await load([
      member({ name: 'OneLiteFeather', profile: 'https://opencollective.com/onelitefeather1' }),
      member({ name: 'Someone', profile: 'https://opencollective.com/onelitefeather' }),
      member({ name: 'Ada', profile: 'https://opencollective.com/ada' })
    ])
    expect(result.map((s) => s.name)).toEqual(['Ada'])
  })

  it('leaves out anonymous accounts', async () => {
    const result = await load([
      member({ name: 'Guest', profile: 'https://opencollective.com/guest-1' }),
      member({ name: 'Incognito', profile: 'https://opencollective.com/incognito-1' }),
      member({ name: ' guest ', profile: 'https://opencollective.com/guest-2' })
    ])
    expect(result).toEqual([])
  })

  it('leaves out profiles that are not on OpenCollective', async () => {
    const result = await load([
      member({ name: 'Evil', profile: 'https://evil.example/marc' }),
      member({ name: 'Js', profile: 'javascript:alert(1)' }),
      member({ name: 'NoProfile', profile: undefined })
    ])
    expect(result).toEqual([])
  })

  it('lists a person once when the profile repeats', async () => {
    const result = await load([member(), member({ name: 'Marc K.' })])
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Marc')
  })

  it('sorts alphabetically without regard to case, not by amount', async () => {
    const result = await load([
      member({ name: 'weltspielt', profile: 'https://opencollective.com/w', totalAmountDonated: 99999 }),
      member({ name: 'Marc', profile: 'https://opencollective.com/m', totalAmountDonated: 1 }),
      member({ name: 'Abarzer', profile: 'https://opencollective.com/a', totalAmountDonated: 500 })
    ])
    expect(result.map((s) => s.name)).toEqual(['Abarzer',
'Marc',
'weltspielt'])
  })

  it('exposes name, image and profile and nothing else', async () => {
    const result = await load([member({ image: S3 })])
    expect(result).toEqual([{ name: 'Marc', image: SMALL_MARC, profile: 'https://opencollective.com/marc44' }])
    const json = JSON.stringify(result)
    for (const secret of ['4200',
'marc@example.org',
'github',
'lastTransactionAt',
'totalAmountDonated']) {
      expect(json, `${secret} must be stripped`).not.toContain(secret)
    }
  })

  it('keeps an avatar only from the OpenCollective hosts over https', async () => {
    const result = await load([
      member({ name: 'A', profile: 'https://opencollective.com/a', image: S3 }),
      member({ name: 'B', profile: 'https://opencollective.com/b', image: 'https://www.gravatar.com/avatar/x?default=404' }),
      member({ name: 'C', profile: 'https://opencollective.com/c', image: 'http://opencollective-production.s3.us-west-1.amazonaws.com/a.png' }),
      member({ name: 'D', profile: 'https://opencollective.com/d', image: null }),
      member({ name: 'E', profile: 'https://opencollective.com/e', image: 'not a url' })
    ])
    expect(result.map((s) => s.image)).toEqual([
      'https://images.opencollective.com/a/avatar/96.png',
      null,
      null,
      null,
      null
    ])
  })

  it('replaces the full-size S3 avatar with Open Collective\'s 96px rendition of the same account', async () => {
    const [supporter] = await load([member({ name: 'Ada', profile: 'https://opencollective.com/ada-lovelace', image: S3 })])
    expect(supporter!.image).toBe('https://images.opencollective.com/ada-lovelace/avatar/96.png')
  })

  it('throws on an error status, so no cache layer stores it', async () => {
    const fetcher = respond({ error: 'nope' }, { status: 404 })
    await expect(loadLiteSupporters(fetcher, { slug: 'x' })).rejects.toThrow(/404/)
  })

  it('throws when the body is not a list', async () => {
    await expect(loadLiteSupporters(respond({ members: [] }), { slug: 'x' })).rejects.toThrow(/list/)
  })

  it('throws when the fetch itself fails', async () => {
    const fetcher = vi.fn(async () => { throw new Error('offline') })
    await expect(loadLiteSupporters(fetcher, { slug: 'x' })).rejects.toThrow('offline')
  })
})
