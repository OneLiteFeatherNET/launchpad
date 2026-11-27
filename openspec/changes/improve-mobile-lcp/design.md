# Design: Cut bandwidth contention for the hero image on mobile

## Context

See `proposal.md`. The hero image is small; the cost is queueing behind scripts
and sibling images on a throttled link. Fewer and later bytes beat a faster
image.

## Goals / Non-Goals

**Goals:** lower mobile LCP p75 on `/en` and `/de`; fewer modulepreloaded
bytes; no CLS, no loss of consent or analytics behaviour.

**Non-Goals:** changing image formats or quality, Cloudflare settings, inline
CSS, the carousel's visual design.

## Decisions

1. **Carousel renders an image only for the current slide (and the next once
   armed).** Slide boxes keep their size, so no CLS. The next slide's image is
   armed on `requestIdleCallback` (fallback `setTimeout`) after mount, or on
   the first navigation input, whichever comes first; autoplay never advances
   to a slide whose image is not armed. The first slide keeps its preload and
   `fetchpriority="high"`. Alt text is part of the image element and thus
   present once it renders. Alternative rejected: `loading="lazy"` plus a
   smaller margin - the margin is browser-controlled.
2. **Logo as a plain `<img>` from `public/`.** Today `NuxtImg` sends
   `images/logo.svg` (and the seasonal logos from `layers/season/utils/seasons.ts`)
   through the resizer as `img.onelitefeather.net/cdn-cgi/image/w=80,h=80,...`,
   a 6.4 KB cross-host request at ~800 ms, during the hero load. An SVG gains
   nothing from resizing; a same-origin `<img src="/images/...">` with fixed
   width/height keeps layout stable and reuses the page's connection.
3. **Modulepreload trim (takes over `perf-critical-render-path` decisions 3
   and 4, not implemented in #656).** Same approach as there: the
   `build:manifest` hook switches off `preload`/`prefetch` for chunks outside
   the first view; the choice of chunks is a pure, importable function tested
   with a handmade manifest. Which chunks stay is decided by measurement
   (task 1.2), and compared by Lighthouse (TBT, LCP), not by link count alone,
   because too little preload lengthens hydration waterfalls. The upper bound
   is enforced by extending `tests/performance/entry-chunk-budget.spec.ts`
   (`PRELOADED_SCRIPTS_BUDGET_BYTES`, currently 434 000), not by a second test.
4. **Icons.** `plugins/fontawesome.ts` no longer exists (#671). The equivalent
   today is `IconFa.vue` resolving string names through `iconRegistry.ts`,
   which imports ~50 icons into the entry. Move to explicit per-component icon
   imports (definitions passed to `IconFa`, as `Carousel.vue` already does) so a
   page's chunks carry only its icons; adapt
   `tests/architecture/fontawesome-registry.spec.ts`. Drop this step if the
   measurement shows less than ~5 KB gain.
5. **Cookie banner:** `LazyCookieConsentBanner` with `hydrate-on-idle`. The SSR
   markup stays, so the banner is visible and accessible before hydration; the
   buttons need hydration, so idle is the trigger.
6. **Measurement:** Lighthouse mobile with `--throttling-method=devtools`
   against `pnpm preview:prod`, on `/en` and `/de/blog`, three runs, median,
   before (`main`) and after. Entry graph measured with a bundle analyser;
   baseline ~506 KB raw / 50 chunks modulepreloaded on `/en` (production). Results are
   recorded in this change's `tasks.md`.

## Risks / Trade-offs

- Delayed next-slide image can flash an empty slide on fast manual navigation:
  mitigated by arming on first input and gating autoplay.
- Lazy hydration delays banner buttons by up to the idle time: acceptable, the
  banner is not LCP and is still rendered.
- Local `pnpm preview:prod` 404s carousel images (provider `none`); measure the
  carousel with `NUXT_IMAGE_PROVIDER=cloudflare` or against production after
  release.
