---
name: bp-no-hydration-mismatch
description: >-
  Prevent SSR/client hydration mismatches on this Nuxt 4 site. Use when
  changing rendering that depends on time, locale, randomness, browser
  APIs, or `useState`/i18n seeding.
---

# No Hydration Mismatch

Single topic: server markup must match client render (report:
"Hydration completed but contains mismatches").

- Wrap inherently client-only output (`Date`/locale/random,
  browser-only APIs) in `<ClientOnly>` or compute it deterministically.
- Seed `useState`/i18n on the server so the first client render matches.
- Avoid `import.meta.client` branching that changes rendered markup.

Verify: load affected routes — no hydration warning in console;
`pnpm build` passes.
