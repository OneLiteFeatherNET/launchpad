---
name: perf-defer-third-party-scripts
description: >-
  Ensure third-party scripts (PostHog, Google gtag) never block initial
  render on this Nuxt 4 site. Use when adding/changing any third-party
  script, analytics, or `nuxt-vitalizer`/`nuxt-posthog`/`nuxt-gtag`.
---

# Defer Third-Party Scripts

Single topic: keep third-party JS off the critical path. This is the
biggest mobile-TBT lever (report: TBT ~1.5 s, dominated by PostHog +
gtag).

- No analytics/marketing script during initial render — load on idle
  (`requestIdleCallback`) or first interaction, and only after consent
  (see `privacy-consent-gating`).
- Configure `nuxt-vitalizer` (installed, currently unconfigured) for
  delayed/idle hydration before hand-rolling deferral.
- PostHog session recording and `surveys.js` load only after the page is
  interactive.
- Never add a new third-party `<script>` without a deferral strategy and
  a before/after mobile Lighthouse run.

Verify: `pnpm build`; mobile Lighthouse pass — report before/after TBT.
