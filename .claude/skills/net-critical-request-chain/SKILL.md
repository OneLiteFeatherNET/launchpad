---
name: net-critical-request-chain
description: >-
  Keep the critical request chain shallow on this Nuxt 4 site. Use when
  adding CSS/JS that imports further blocking resources, or changing the
  document head.
---

# Critical Request Chain

Single topic: shallow critical chain, correct priority (report:
`network-dependency-tree-insight`).

- Avoid CSS/JS that chains into more blocking CSS/JS.
- Critical resources are requested early with high priority; the LCP
  resource specifically is handled in `perf-lcp-element`.
- Defer non-critical resources so they don't extend the chain.

Verify: mobile Lighthouse — dependency tree depth not regressed.
