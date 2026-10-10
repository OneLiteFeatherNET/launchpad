import type { ConsentState } from '../types'

export const CONSENT_COOKIE = 'olf_consent'

/** About six months: long enough to spare a visitor the banner, short enough to ask again. */
export const CONSENT_MAX_AGE_SECONDS = 182 * 24 * 60 * 60

/** Parses the decoded cookie value; anything malformed is no decision at all. */
export function parseConsent(raw: string): ConsentState | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (value === null || typeof value !== 'object') return null
    const { analytics, decidedAt } = value as Record<string, unknown>
    if (typeof analytics !== 'boolean') return null
    if (typeof decidedAt !== 'string' || Number.isNaN(Date.parse(decidedAt))) return null
    return { analytics, decidedAt }
  } catch {
    return null
  }
}

/** Reads the consent cookie out of a `document.cookie`-style header. */
export function readConsentCookie(cookieHeader: string): ConsentState | null {
  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.trim().split('=')
    if (name !== CONSENT_COOKIE) continue
    try {
      return parseConsent(decodeURIComponent(rest.join('=')))
    } catch {
      return null
    }
  }
  return null
}

/** The string assigned to `document.cookie`. `Secure` only on https. */
export function consentCookieString(state: ConsentState, secure: boolean): string {
  const attributes = [
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(state))}`,
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax',
  ]
  if (secure) attributes.push('Secure')
  return attributes.join('; ')
}
