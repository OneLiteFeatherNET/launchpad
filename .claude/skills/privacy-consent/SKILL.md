---
name: privacy-consent
description: >-
  Audit changes for privacy and consent handling on this Nuxt 4 site —
  cookie-consent gating of analytics, third-party data flow minimisation,
  GDPR-aligned PostHog/gtag usage. Use when touching `nuxt-posthog`,
  `nuxt-gtag`, cookies, tracking, or anything loading third-party code.
---

# Privacy & Consent Review

The Lighthouse report shows third-party cookies set unconditionally
(Google `NID`, PostHog) and cookie issues in the DevTools Issues panel —
analytics currently runs without a consent gate. This skill keeps new
work from making that worse and guides the eventual fix. (Mechanics for
the perf/best-practices side live in `lighthouse-perf` /
`lighthouse-best-practices`; this skill owns the privacy stance.)

## Consent gating
- No analytics/marketing cookie or network call before explicit opt-in.
  `nuxt-gtag` and `nuxt-posthog` must initialise only after consent;
  default state is "no tracking".
- Consent choice is persisted (first-party) and revocable; revoking
  stops collection and clears vendor cookies.
- Strictly-necessary cookies (i18n `i18n_redirected`, consent itself)
  are exempt and must stay functional without consent.

## Data minimisation
- Keep PostHog `proxy: true` so analytics is same-origin; do not add
  vendors that bypass the proxy.
- Collect the minimum: avoid PII in event properties; respect
  `anonymize_ip` (already set for gtag) and PostHog masking for session
  recording. Do not enable session recording/surveys before consent.
- New third-party embed/script → document what data it sees and why.

## Transparency
- Any new data flow is reflected in the privacy page content
  (`content/`), and the cookie/consent UI lists the actual vendors.

## Verification
- `pnpm build` passes.
- Manually confirm in DevTools (Application → Cookies / Network) that a
  fresh visit with no consent sets **no** analytics cookies and makes
  **no** tracking requests; tracking begins only after opt-in.
