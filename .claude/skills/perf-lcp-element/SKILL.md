---
name: perf-lcp-element
description: >-
  Keep the Largest Contentful Paint element fast and discoverable on this
  Nuxt 4 site. Use when changing the hero/above-the-fold content or its
  image on any page.
---

# LCP Element

Single topic: the LCP element loads early (report: mobile LCP 3.5 s).

- LCP element (hero text/image) is server-rendered, not behind
  `<ClientOnly>` or client-only branching.
- LCP image: `fetchpriority="high"`, not lazy-loaded, correctly sized
  `<NuxtImg>` (Cloudflare provider, avif/webp, quality 75).
- No render-blocking work delays the LCP paint.

Verify: `pnpm build`; mobile Lighthouse — report before/after LCP.
