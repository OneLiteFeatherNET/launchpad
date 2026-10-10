// @vitest-environment nuxt
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSeason } from '../../layers/season/composables/useSeason'

/**
 * What the server decides from: NUXT_PUBLIC_SEASON, then the calendar — and
 * nothing from the request, because the HTML is cached at the edge. The rule
 * itself is covered in resolve-season.spec.ts; this holds the wiring.
 */

const { request } = vi.hoisted(() => ({ request: { season: '' } }))

// Wraps the real composable: Nuxt itself reads the runtime config while
// booting the test app, and a bare stub would take app.baseURL away.
mockNuxtImport('useRuntimeConfig', (original) => () => {
  const config = original()
  return { ...config, public: { ...config.public, season: request.season } }
})
// A fresh state per call: the real one is per request, and each case here is one.
mockNuxtImport('useState', (original) => (key: string, init?: () => unknown) => key === 'season' && init ? { value: init() } : original(key, init))

function seasonWith(season = '') {
  request.season = season
  return useSeason().value?.id ?? null
}

describe('useSeason', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('follows the calendar without an override', () => {
    vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
    expect(seasonWith()).toBe('halloween')
    vi.setSystemTime(new Date('2026-07-15T12:00:00Z'))
    expect(seasonWith()).toBeNull()
  })

  it('lets NUXT_PUBLIC_SEASON force a season on or off', () => {
    vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
    expect(seasonWith('none')).toBeNull()
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'))
    expect(seasonWith('halloween')).toBe('halloween')
  })
})
