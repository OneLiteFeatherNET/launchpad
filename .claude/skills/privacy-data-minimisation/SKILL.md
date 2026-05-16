---
name: privacy-data-minimisation
description: >-
  Minimise third-party data exposure on this Nuxt 4 site. Use when
  changing analytics events, PostHog/gtag config, or session recording.
---

# Data Minimisation

Single topic: collect the least, same-origin.

- Keep PostHog `proxy: true` (same-origin); don't add vendors that
  bypass the proxy.
- No PII in event properties; keep gtag `anonymize_ip`; apply PostHog
  masking. Session recording/surveys not enabled before consent.

Verify: inspect emitted events/requests on affected flows — no PII, no
unproxied vendor calls.
