---
name: privacy-consent-gating
description: >-
  Gate analytics/marketing behind explicit consent on this Nuxt 4 site
  (nuxt-posthog, nuxt-gtag). Use when touching tracking init, cookies, or
  the consent UI.
---

# Consent Gating

Single topic: no tracking before opt-in (report: `NID`/PostHog cookies
set unconditionally).

- `nuxt-gtag`/`nuxt-posthog` initialise only after explicit consent;
  default state is no tracking. No analytics cookie/request pre-opt-in.
- Consent is persisted first-party, revocable; revoking stops collection
  and clears vendor cookies.
- Strictly-necessary cookies (`i18n_redirected`, the consent cookie) are
  exempt and work without consent.

Verify: fresh visit with no consent sets no analytics cookies and makes
no tracking requests (DevTools Application/Network); tracking starts only
after opt-in.
