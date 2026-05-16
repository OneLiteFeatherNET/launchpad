---
name: sec-content-security-policy
description: >-
  Maintain a tight Content-Security-Policy on this Nuxt 4 / Cloudflare
  site. Use when adding scripts, styles, origins, or embeds that the CSP
  must allow.
---

# Content Security Policy

Single topic: a CSP covering exactly the real origins in use.

- Allow only what is used: self, PostHog proxy, gtag, Cloudflare image
  host. Prefer nonce/hash over `unsafe-inline`.
- Any new script/style/origin must be reflected in the CSP; document any
  unavoidable broad directive.
- Keep `frame-ancestors` aligned with `sec-response-headers`.

Verify: affected routes render with no CSP violations in the console.
