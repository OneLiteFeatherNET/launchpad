---
name: sec-response-headers
description: >-
  Set hardening response headers uniformly on this Nuxt 4 / Cloudflare
  site (excluding CSP, which has its own skill). Use when changing
  `routeRules` or Nitro/Cloudflare response config.
---

# Security Response Headers

Single topic: hardening headers (CSP lives in
`sec-content-security-policy`).

- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, restrictive `Permissions-Policy`, frame protection
  (`frame-ancestors`/`X-Frame-Options`).
- Applied uniformly via Nitro `routeRules`, not per page.

Verify: inspect response headers on affected routes; all present.
