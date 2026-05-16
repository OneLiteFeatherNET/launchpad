---
name: web-security
description: >-
  Audit changes against web.dev "Safe" guidance for this Nuxt 4 /
  Cloudflare site — HTTPS, security headers (CSP, HSTS, X-Content-Type),
  Trusted Types, safe cross-origin embeds, no mixed/insecure requests,
  dependency safety. Use when touching headers, scripts, embeds, external
  resources, or `nuxt.config.ts` route rules.
---

# Web Security Review (web.dev "Safe")

The Lighthouse best-practices report flagged `ERR_CERT_AUTHORITY_INVALID`
and third-party-cookie/inspector issues — security hygiene is not yet
clean. Apply this checklist to changed `nuxt.config.ts`, `server/`,
`plugins/`, components embedding external content, and any new dependency.

## Transport & resources
- All sub-resources load over HTTPS with a valid certificate — no
  `http://`, no invalid-cert hosts (root cause of the console error).
- No mixed content; external images go through the Cloudflare image
  proxy / `<NuxtImg>`, not arbitrary origins.

## Headers (set via Nitro route rules / Cloudflare)
- A Content-Security-Policy that covers the real origins in use
  (self, PostHog proxy, gtag, Cloudflare image host) — prefer nonce/hash
  over broad `unsafe-inline`; document any unavoidable exception.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, a restrictive `Permissions-Policy`, and frame
  protection (`frame-ancestors` / `X-Frame-Options`).
- Headers belong in `routeRules`/Nitro config, applied uniformly — not
  ad-hoc per page.

## Embeds & links
- External embeds (e.g. BlueMap iframe) are sandboxed and least-privilege.
- Every `target="_blank"` has `rel="noopener noreferrer"` (already the
  pattern — keep it).

## Dependencies
- No new dependency without justification (AGENTS.md rule); check it is
  maintained and not flagged by Dependabot before adding.

## Verification
- `pnpm build` passes; `pnpm seo:lighthouse` best-practices not regressed.
- Manually verify response headers and a clean console (no security
  warnings in the DevTools Issues panel) for affected routes.
