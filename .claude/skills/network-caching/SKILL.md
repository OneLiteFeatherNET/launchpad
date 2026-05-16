---
name: network-caching
description: >-
  Audit changes against web.dev network/loading guidance for this Nuxt 4
  / Cloudflare site — cache lifetimes, preconnect/preload/priority hints,
  compression, request ordering and the critical request chain. Use when
  touching asset loading, fonts, images, third-party origins, or
  Nitro/Cloudflare caching config.
---

# Network & Caching Review (web.dev "Fast" — loading)

The Lighthouse report flagged inefficient cache lifetimes (~79 KiB),
render-blocking CSS, a non-trivial network dependency tree and (mobile)
LCP request discovery. Apply to changed `nuxt.config.ts`, `routeRules`,
`server/`, fonts/`assets/css/`, and components adding external origins.

## Caching
- Static hashed assets (`/_nuxt/*`) get long-lived immutable caching;
  HTML stays short/revalidated (and `Cache-Control: no-store` is *not*
  set — that also breaks bfcache, see `lighthouse-best-practices`).
- Set cache headers via Nitro `routeRules`, leveraging the Cloudflare
  edge — uniform, not per-component.

## Connection setup
- `preconnect` (with `crossorigin` where credentialed) to required
  third-party origins actually on the critical path (PostHog proxy,
  Cloudflare image host) — no speculative preconnects to unused origins.
- `dns-prefetch` only as a progressive fallback.

## Priority & critical chain
- LCP image: `fetchpriority="high"`, discoverable in initial HTML, no
  lazy-loading above the fold. Below-the-fold media: `loading="lazy"`.
- `preload` only genuinely critical resources (LCP image, critical
  font); never preload everything (defeats prioritisation).
- Keep the critical request chain shallow — avoid CSS/JS that imports
  more blocking CSS/JS; defer non-critical CSS.

## Fonts & compression
- Fonts: `font-display: swap`, `preload` the one critical face, prefer
  self-host/woff2 with size-adjust to avoid CLS.
- Ensure Brotli/gzip is in effect at the Cloudflare edge for text assets.

## Verification
- `pnpm build` passes; `pnpm seo:lighthouse` not regressed.
- Inspect the Network panel (and a mobile Lighthouse run): confirm cache
  headers, no redundant preconnects, and the LCP resource is requested
  early with high priority. Report before/after LCP for loading changes.
