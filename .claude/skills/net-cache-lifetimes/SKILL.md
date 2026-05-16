---
name: net-cache-lifetimes
description: >-
  Set efficient cache lifetimes for assets on this Nuxt 4 / Cloudflare
  site. Use when changing `routeRules`, Nitro/Cloudflare caching, or
  asset output.
---

# Cache Lifetimes

Single topic: correct `Cache-Control` per asset class (report:
`cache-insight`, ~79 KiB).

- Hashed static assets (`/_nuxt/*`): long-lived `immutable`.
- HTML: short / revalidated — and **not** `no-store` (that also breaks
  bfcache, see `bp-bfcache`).
- Set headers uniformly via Nitro `routeRules` at the Cloudflare edge,
  not per component.

Verify: inspect response headers for affected routes; `cache-insight`
not regressed.
