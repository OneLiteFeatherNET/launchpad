---
name: perf-no-legacy-js
description: >-
  Avoid shipping legacy/transpiled JS and needless polyfills on this
  Nuxt 4 site. Use when changing the build target, Vite/Nitro config, or
  adding tooling that affects transpilation.
---

# No Legacy JavaScript

Single topic: don't ship transpiled/polyfilled code for syntax modern
browsers already support (report: `legacy-javascript-insight`, ~30 KiB).

- Keep the build target modern; do not lower it or add broad polyfills.
- Don't add Babel/core-js presets without clear justification.
- Audit new deps for bundled legacy polyfills.

Verify: `pnpm build`; confirm `legacy-javascript-insight` did not regress.
