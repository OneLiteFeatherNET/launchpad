---
name: lighthouse-perf
description: >-
  Diagnose and fix Lighthouse performance regressions on this Nuxt 4 site
  (TBT, LCP, CLS, JS execution, third-party scripts, render-blocking). Use
  whenever a page change can affect load/runtime cost, when adding scripts or
  modules, or when the Lighthouse performance score drops — especially on the
  mobile form factor, which CI does not yet cover.
---

# Lighthouse Performance Review (Nuxt 4 / Cloudflare)

CI (`.lighthouserc.json`) only runs the **desktop** preset. The known
problem profile is **mobile**: TBT ~1.5 s, CLS ~0.28, TTI ~7.5 s while
desktop is ~0.93. Always re-check mobile after changes — desktop green
does not mean mobile is fine.

Apply this checklist to changed `.vue`/`.ts` files under `pages/`,
`components/`, `layouts/`, `plugins/`, and to `nuxt.config.ts`.

## Third-party scripts (biggest TBT lever)

The main-thread cost is dominated by PostHog (`nuxt-posthog`, including
`surveys.js` / `posthog-recorder.js`) and Google Ads/gtag
(`nuxt-gtag`, `gtag/js?id=AW-...`).

- `nuxt-vitalizer` is installed and enabled but **unconfigured**. Configure
  it (`disableStylesheets`/`prefetchLinks` and especially delayed/idle
  hydration) before hand-rolling anything.
- Defer non-critical third-party JS until idle or first interaction — never
  load analytics/session-recording during initial render. Use
  `useScriptEventPage`/Nuxt Scripts patterns, `requestIdleCallback`, or the
  module's lazy/consent gate. PostHog session recording and surveys must
  load **after** the page is interactive.
- Consider PartyTown / web-worker offload for gtag if it cannot be deferred.
- Gate analytics behind cookie consent — this also fixes the
  best-practices cookie audit (see `lighthouse-best-practices` skill).
- Never add a new third-party `<script>` without a deferral strategy and a
  before/after mobile Lighthouse run.

## JavaScript payload

- Reduce unused JS: the largest first-party chunks (`_nuxt/*.js`) ship
  ~75 KiB unused. Prefer dynamic `import()` / `defineAsyncComponent` and
  route-level code splitting for below-the-fold and interaction-only code.
- Minify: ensure no un-minified first-party JS ships in production builds.
- Legacy JS: avoid transpilation/polyfills for already-supported syntax;
  keep the build target modern.
- FontAwesome: import only the specific icons used (tree-shaken via the
  SVG core), never whole icon packs.

## Render-blocking & LCP

- `_nuxt/entry.*.css` is render-blocking. Keep critical CSS inlined and
  defer the rest; do not add global CSS imports in `nuxt.config.ts` `css[]`
  without justification.
- Ensure the LCP element (hero text/image) is discoverable in the initial
  HTML — no client-only wrapper, `fetchpriority="high"` on the LCP image,
  and a correctly sized `<NuxtImg>` (the project uses the Cloudflare
  provider, `avif`/`webp`, quality 75).

## CLS

- The current culprit is the `<footer>` (`components/features/footer/Footer.vue`)
  shifting layout late (mobile CLS 0.28). Reserve space for
  late-loading/async content: fixed dimensions or `min-h-*` on images,
  embeds, and any block whose content arrives after hydration.
- Never insert content above existing content after load. Web fonts must
  not cause reflow (`font-display: swap` + size-adjust, or self-host).

## Verification (required)

1. `pnpm build` must pass.
2. `pnpm seo:lighthouse` (desktop gate) must stay green.
3. For any change touching scripts, hydration, images, or layout, run a
   **mobile** Lighthouse pass locally (`lighthouse <url>
   --preset=... --form-factor=mobile`, or Chrome DevTools mobile) and
   report before/after TBT, LCP, CLS, TTI. Do not claim a perf fix without
   the mobile numbers.
