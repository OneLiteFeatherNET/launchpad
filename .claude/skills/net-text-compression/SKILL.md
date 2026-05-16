---
name: net-text-compression
description: >-
  Ensure text assets are compressed at the edge on this Nuxt 4 /
  Cloudflare site. Use when changing Nitro/Cloudflare output or adding
  large text assets.
---

# Text Compression

Single topic: Brotli/gzip in effect for text assets (JS/CSS/HTML/JSON).

- Confirm the Cloudflare edge serves compressed responses; don't disable
  compression in Nitro/Cloudflare config.
- Don't pre-serve already-compressed assets uncompressed.

Verify: response `content-encoding` is `br`/`gzip` for text assets on
affected routes.
