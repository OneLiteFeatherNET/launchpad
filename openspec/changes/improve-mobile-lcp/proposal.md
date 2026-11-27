# Proposal: Cut bandwidth contention for the hero image on mobile

Ships as `perf(lcp)`. Pull request title:
`perf(lcp): cut bandwidth contention for the hero image on mobile`

## Why

Field data (Cloudflare Web Analytics, p75) shows INP and CLS fine, LCP mostly
below 2.5 s but 2.7-6.5 s on several days, FCP around or above 1.8 s.
Lighthouse mobile (simulated) reports LCP 3.3-4.2 s on `/en`, `/de`,
`/en/blog` and `/de/blog` (2026-11-27).

A DevTools-throttled run on `/en` splits the LCP as: TTFB 583 ms, load delay
188 ms, image load 2200 ms, render delay 23 ms. The hero image is only ~14 KB;
it is slow because it shares the link with ~50 modulepreloaded JS chunks
(~440 KB transferred) and four off-screen carousel images (~90 KB).
Experiments: blocking the other carousel/logo images moves LCP from 2993 to
2614 ms; blocking `/_nuxt/*` scripts moves it to 1694 ms.

The field data (30 Oct - 27 Nov 2026) mostly predates release 1.43.0/1.44.x
(26 Nov 2026), which shipped #656, #671, #674 and #675. The lab measurements of
27 Nov run against the current release, so they show what is still left.

## Already addressed (not repeated here)

- `perf-home-lcp-image` (#643): single image preload with `fetchpriority`.
  Group 1 builds on it.
- `perf-defer-session-recording` (#644) and lazy posthog-js after hydration
  (#656, `lazyPosthog.ts`, `posthog.client.ts`): posthog is no longer part of
  this change.
- `perf-critical-render-path` (#656): CSS inlining and lazy posthog shipped;
  its design decisions 3 (trim modulepreload) and 4 (shrink entry JS) did not.
  This change takes over those two decisions.
- #671: Font Awesome runtime and stylesheet are gone; icons are plain `<svg>`
  through `IconFa`.

## What Changes

Three independent groups, each shippable and revertable on its own:

1. **Carousel loads only the current slide's image** (builds on #643). All six
   slides sit side by side; `loading="lazy"` does not help because slides at
   x = 412-1648 px are inside Chrome's lazy-load margin. Only the current
   slide's image is in the server HTML; the next one is fetched when idle or
   just before it becomes visible. Expected gain ~0.35-0.4 s mobile LCP.
2. **Navigation logo served directly from `public/`** instead of through
   `NuxtImg` and the Cloudflare image resizer (`NavigationBar.vue`), removing
   a cross-host request to `img.onelitefeather.net` during LCP. The default
   and all seasonal logos are SVGs in `public/images/`.
3. **Fewer modulepreloaded scripts** (takes over decisions 3 and 4 of
   `perf-critical-render-path`): a `build:manifest` hook, written as a pure
   function, drops `modulepreload` for chunks outside the first view;
   `IconFa` stops pulling the string-keyed registry of ~50 icons into the entry
   chunk (per-component icon imports); the cookie-consent banner hydrates
   lazily; the entry graph is measured before and after.

## Capabilities

### New Capabilities

- `web-performance`: what the first load of a page may fetch, and when
  non-critical scripts start.

### Modified Capabilities

None.

## Out of scope

- Cloudflare zone settings (JS Detections, Bot Fight Mode, Web Analytics
  auto-injection add ~22 KB and ~200 ms of JS): a dashboard decision, no code.
- Inline CSS (`features.inlineStyles`) stays as it is.
- The blog `Top1.vue` image sharpness bug ships separately as a `fix`.

## Impact

- `layers/home/components/Carousel.vue`, `CarouselItemImage.vue` and siblings
- `layers/navigation/components/NavigationBar.vue`
- `nuxt.config.ts` and a new pure function for the `build:manifest` hook
- `layers/base` (`IconFa.vue`, `utils/iconRegistry.ts`), `layers/consent`
  (banner usage); `tests/architecture/fontawesome-registry.spec.ts` adapts
- `tests/performance/entry-chunk-budget.spec.ts` (extended), new component
  and unit tests
- Pages stay request-independent and edge-cacheable
  (`tests/architecture/request-independent-render.spec.ts`).
- No new dependencies.
