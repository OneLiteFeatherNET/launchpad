---
name: sec-no-mixed-content
description: >-
  Ensure every sub-resource loads over valid HTTPS on this Nuxt 4 site.
  Use when adding images, scripts, fonts, embeds, or external origins.
---

# No Mixed / Insecure Content

Single topic: all sub-resources HTTPS with a valid certificate (report
root cause: `net::ERR_CERT_AUTHORITY_INVALID`).

- No `http://` resources; no invalid/untrusted-cert hosts.
- External images go through the Cloudflare image proxy / `<NuxtImg>`.
- Fixing this also clears the related `bp-clean-console` error.

Verify: load affected routes — no mixed-content/cert error in console
or DevTools Issues panel.
