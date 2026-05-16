---
name: lighthouse-best-practices
description: >-
  Diagnose and fix Lighthouse "Best Practices" failures on this Nuxt 4 site
  (console errors, hydration mismatches, third-party cookies, back/forward
  cache, missing source maps). Use when changing scripts, analytics, cookies,
  SSR/hydration behaviour, or when the best-practices score is below 0.9.
---

# Lighthouse Best Practices Review (Nuxt 4 / Cloudflare)

Current best-practices score is ~0.73 (CI gate is `warn`, minScore 0.9 —
keep it green, do not let it regress further). The failing audits and the
fix patterns for this repo:

## Console errors (`errors-in-console`)

Two known errors:

- **`net::ERR_CERT_AUTHORITY_INVALID`** — a resource is loaded over a
  host with an invalid/untrusted certificate. Find the offending request
  (analytics proxy, image/CDN host, embed) and serve it from a valid-cert
  origin or the first-party proxy. Never ship mixed/invalid-cert requests.
- **`Hydration completed but contains mismatches`** — SSR markup differs
  from client render. Common causes here: `Date`/locale/random values
  rendered without `<ClientOnly>`, `import.meta.client` branching in
  templates, i18n/`useState` not seeded on the server, or
  browser-only APIs read during setup. Fix the markup-divergence at the
  source; do not silence it. Zero console errors/warnings is the bar.

## Third-party cookies (`third-party-cookies`)

`NID` (Google) and PostHog cookies are set unconditionally. Fixes:

- Gate `nuxt-gtag` and `nuxt-posthog` initialisation behind explicit
  cookie consent; do not set analytics cookies before opt-in.
- Prefer first-party proxying (PostHog `proxy: true` is already set —
  keep analytics requests same-origin) and cookieless/consentless modes
  where the vendor supports them.
- This audit overlaps with the `lighthouse-perf` deferral work — deferring
  + consent-gating analytics fixes both at once.

## Back/forward cache (`bf-cache`)

"Navigation was cancelled before the page could be restored." Avoid
`unload` listeners, keep `Cache-Control: no-store` off HTML responses, and
do not hold open connections that block bfcache. Verify in Chrome DevTools
→ Application → Back/forward cache → "Test".

## Missing source maps (`valid-source-maps`)

Large first-party JS ships without source maps. Enable production client
source maps in `nuxt.config.ts` (e.g. `sourcemap.client`) so the audit
passes and prod stack traces are usable. Confirm the build still deploys
on the Cloudflare `cloudflare_module` preset.

## Inspector / cookie issues (`inspector-issues`)

Resolve the Chrome "Issues" panel entries (cookie attribute / deprecation
warnings) surfaced by the same analytics scripts — usually fixed by the
consent gating and first-party proxying above.

## Verification (required)

1. `pnpm build` must pass.
2. `pnpm seo:lighthouse`; report the `best-practices` score and confirm
   no audit listed above regressed.
3. Manually confirm a clean console (no errors/warnings) and a passing
   bfcache test in DevTools for any change touching scripts, cookies,
   SSR, or hydration.
