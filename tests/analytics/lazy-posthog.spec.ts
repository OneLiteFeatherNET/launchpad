import { describe, expect, it, vi } from 'vitest'
import type { PostHog } from 'posthog-js'
import { createLazyPostHog } from '../../layers/base/utils/lazyPosthog'

function realClient() {
  const calls: string[] = []
  const client = {
    capture: (event: string) => calls.push(`capture ${event}`),
    opt_in_capturing: () => calls.push('opt_in'),
    opt_out_capturing: () => calls.push('opt_out'),
    has_opted_out_capturing: () => false,
    startSessionRecording: () => calls.push('record'),
  }
  return { calls, client: client as unknown as PostHog }
}

describe('createLazyPostHog', () => {
  it('holds calls back until the real client is attached', () => {
    const { client, attach } = createLazyPostHog()
    const real = realClient()
    client.capture('a')
    expect(real.calls).toEqual([])
    attach(real.client)
    expect(real.calls).toEqual(['capture a'])
  })

  it('replays calls in the order they were made', () => {
    const { client, attach } = createLazyPostHog()
    const real = realClient()
    client.opt_out_capturing()
    client.capture('a')
    client.opt_in_capturing()
    attach(real.client)
    expect(real.calls).toEqual(['opt_out',
'capture a',
'opt_in'])
  })

  it('forwards calls directly once attached', () => {
    const { client, attach } = createLazyPostHog()
    const real = realClient()
    attach(real.client)
    client.capture('b')
    expect(real.calls).toEqual(['capture b'])
  })

  it('replays each queued call once', () => {
    const { client, attach } = createLazyPostHog()
    const real = realClient()
    client.capture('a')
    attach(real.client)
    attach(real.client)
    expect(real.calls).toEqual(['capture a'])
  })

  it('reports the queued opt-out before the real client exists', () => {
    const { client } = createLazyPostHog()
    expect(client.has_opted_out_capturing()).toBe(false)
    client.opt_out_capturing()
    expect(client.has_opted_out_capturing()).toBe(true)
    client.opt_in_capturing()
    expect(client.has_opted_out_capturing()).toBe(false)
  })

  it('asks the real client for the opt-out state once attached', () => {
    const { client, attach } = createLazyPostHog()
    const real = realClient()
    real.client.has_opted_out_capturing = vi.fn(() => true)
    client.opt_in_capturing()
    attach(real.client)
    expect(client.has_opted_out_capturing()).toBe(true)
  })
})
