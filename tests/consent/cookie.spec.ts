import { describe, expect, it } from 'vitest'
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  consentCookieString,
  parseConsent,
  readConsentCookie,
} from '../../layers/consent/utils/consentCookie'

const DECIDED_AT = '2026-10-10T12:00:00.000Z'
const accepted = { analytics: true, decidedAt: DECIDED_AT }

/** The `name=value` pair a browser would send back, i.e. the cookie without its attributes. */
const sentBack = (setCookie: string) => setCookie.split('; ')[0] ?? ''

describe('consent cookie', () => {
  it('is written under the olf_consent name', () => {
    expect(consentCookieString(accepted, false)).toMatch(new RegExp(`^${CONSENT_COOKIE}=`))
  })

  it('expires after about six months', () => {
    expect(consentCookieString(accepted, false)).toContain(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`)
    expect(CONSENT_MAX_AGE_SECONDS).toBe(182 * 24 * 60 * 60)
  })

  it('is site-wide and sent on same-site navigations only', () => {
    const cookie = consentCookieString(accepted, false)
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('SameSite=Lax')
  })

  it('is marked Secure on https', () => {
    expect(consentCookieString(accepted, true).split('; ')).toContain('Secure')
  })

  it('is not marked Secure on plain http', () => {
    expect(consentCookieString(accepted, false).split('; ')).not.toContain('Secure')
  })

  it('reads back the choice it wrote', () => {
    expect(readConsentCookie(sentBack(consentCookieString(accepted, false)))).toEqual(accepted)
  })

  it('finds its own cookie among other cookies', () => {
    const header = `i18n_redirected=en; ${sentBack(consentCookieString(accepted, false))}; other=1`
    expect(readConsentCookie(header)).toEqual(accepted)
  })

  it('returns null when no consent cookie is present', () => {
    expect(readConsentCookie('i18n_redirected=en')).toBeNull()
  })

  it('returns null for a value that is not valid JSON', () => {
    expect(readConsentCookie(`${CONSENT_COOKIE}=%7B`)).toBeNull()
  })

  it('rejects a stored choice whose analytics flag is not a boolean', () => {
    expect(parseConsent(JSON.stringify({ analytics: 'yes', decidedAt: DECIDED_AT }))).toBeNull()
  })

  it('rejects a stored choice without a valid decision time', () => {
    expect(parseConsent(JSON.stringify({ analytics: true, decidedAt: 'not a date' }))).toBeNull()
  })
})
