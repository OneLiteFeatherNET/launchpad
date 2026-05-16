---
name: bp-clean-console
description: >-
  Keep the browser console free of errors and warnings on this Nuxt 4
  site. Use when changing scripts, network calls, or anything that can
  log to the console.
---

# Clean Console

Single topic: zero console errors/warnings (report: `errors-in-console`,
incl. a `net::ERR_CERT_AUTHORITY_INVALID` resource).

- No failing/insecure requests (root cause of the cert error — fix the
  origin, see `sec-no-mixed-content`).
- No unhandled promise rejections or thrown errors on load/interaction.
- Don't silence errors; fix the source.

Verify: load affected routes with DevTools open — console is clean;
`pnpm seo:lighthouse` best-practices not regressed.
