---
name: net-resource-hints
description: >-
  Use connection resource hints (preconnect/preload/dns-prefetch)
  correctly on this Nuxt 4 site. Use when adding third-party origins or
  critical resources.
---

# Resource Hints

Single topic: only hint resources actually on the critical path.

- `preconnect` (with `crossorigin` when credentialed) to required
  third-party origins on the critical path (PostHog proxy, Cloudflare
  image host) — no speculative preconnects to unused origins.
- `preload` only genuinely critical resources (LCP image, critical
  font); preloading everything defeats prioritisation.
- `dns-prefetch` only as a progressive fallback.

Verify: Network panel shows no unused/early hints; LCP not regressed.
