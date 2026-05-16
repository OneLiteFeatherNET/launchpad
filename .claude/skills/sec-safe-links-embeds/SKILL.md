---
name: sec-safe-links-embeds
description: >-
  Keep external links and embeds safe on this Nuxt 4 site. Use when
  adding `target="_blank"` links or iframe/external embeds (e.g.
  BlueMap).
---

# Safe External Links & Embeds

Single topic: least-privilege external links/embeds.

- Every `target="_blank"` has `rel="noopener noreferrer"` (existing
  pattern — keep it).
- External embeds (BlueMap iframe) are `sandbox`ed with the minimum
  permissions and a fixed size (also helps `perf-cls-layout-stability`).

Verify: inspect changed links/embeds for `rel`/`sandbox`; no console
warnings.
