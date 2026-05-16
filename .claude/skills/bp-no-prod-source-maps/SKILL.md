---
name: bp-no-prod-source-maps
description: >-
  Enforce the policy that source maps are never published to production
  on this Nuxt 4 / Cloudflare site. Use when changing build/sourcemap
  config or error-monitoring integration.
---

# No Production Source Maps (policy)

Single topic, **hard policy**: never serve source maps publicly.

- No public `.map` files, no public `sourceMappingURL` in shipped
  bundles. Do not enable a plain `sourcemap.client` that emits them.
- The Lighthouse `valid-source-maps` audit is an **accepted trade-off** —
  do not "fix" it by publishing maps.
- If symbolication is needed: generate **hidden** maps in CI and upload
  them privately to the error monitor; never deploy them to Cloudflare.

Verify: `pnpm build` output contains no public `.map` /
`sourceMappingURL` for first-party bundles.
