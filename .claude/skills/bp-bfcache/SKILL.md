---
name: bp-bfcache
description: >-
  Keep pages eligible for the browser back/forward cache on this Nuxt 4
  site. Use when adding unload listeners, connections, or changing HTML
  cache headers.
---

# Back/Forward Cache Eligibility

Single topic: don't break bfcache (report: `bf-cache` failure).

- No `unload` event listeners (use `pagehide`/`visibilitychange`).
- Do not set `Cache-Control: no-store` on HTML responses.
- Don't hold open connections that block bfcache.

Verify: Chrome DevTools → Application → Back/forward cache → "Test"
passes for affected routes.
