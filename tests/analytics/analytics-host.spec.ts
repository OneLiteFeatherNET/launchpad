import { describe, expect, it } from 'vitest'
import { isAnalyticsHost, productionHostname } from '../../layers/base/utils/analyticsHost'

const PRODUCTION = 'onelitefeather.net'

describe('analytics host gate', () => {
  it('captures on the production host', () => {
    expect(isAnalyticsHost('onelitefeather.net', PRODUCTION)).toBe(true)
  })

  it('stays silent on localhost', () => {
    expect(isAnalyticsHost('localhost', PRODUCTION)).toBe(false)
  })

  it('stays silent on 127.0.0.1', () => {
    expect(isAnalyticsHost('127.0.0.1', PRODUCTION)).toBe(false)
  })

  it('stays silent on a host with a port, such as the production preview on 8787', () => {
    expect(isAnalyticsHost('localhost:8787', PRODUCTION)).toBe(false)
  })

  it('stays silent on a workers.dev preview alias', () => {
    expect(isAnalyticsHost('launchpad.example.workers.dev', PRODUCTION)).toBe(false)
  })

  it('stays silent when the hostname is empty', () => {
    expect(isAnalyticsHost('', PRODUCTION)).toBe(false)
  })

  it('stays silent when no production host is configured, as in dev and preview builds', () => {
    expect(isAnalyticsHost('onelitefeather.net', undefined)).toBe(false)
  })

  it('stays silent when the configured production host is empty', () => {
    expect(isAnalyticsHost('', '')).toBe(false)
  })

  it('reads the production hostname from the site URL', () => {
    expect(productionHostname('https://onelitefeather.net')).toBe('onelitefeather.net')
  })

  it('has no production hostname when no site URL is configured', () => {
    expect(productionHostname(undefined)).toBeUndefined()
  })

  it('has no production hostname when the site URL is not a URL', () => {
    expect(productionHostname('onelitefeather.net')).toBeUndefined()
  })
})
