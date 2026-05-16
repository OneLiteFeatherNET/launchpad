---
name: perf-main-thread-work
description: >-
  Reduce first-party main-thread work and long tasks on this Nuxt 4 site
  (INP/TBT). Use when adding client-side logic, heavy computation, or
  event handlers. Mirrors web.dev Learn Performance "Web Workers".
---

# Main-Thread Work (INP / TBT)

Single topic: keep the main thread free so the page stays responsive
(report: `mainthread-work-breakdown` 3.9 s, `bootup-time` 2.6 s,
TBT 1520 ms, max-FID 560 ms). This is the Core Web Vital **INP** lever
for first-party code (third-party deferral is `perf-defer-third-party-scripts`).

- No long tasks (>50 ms) during load/interaction; break work into chunks
  (`scheduler.yield`/`requestIdleCallback`) or move heavy/CPU work to a
  **Web Worker**.
- Keep client hydration cost low: avoid eager heavy components; prefer
  server rendering and lazy/async client islands.
- Event handlers do minimal synchronous work; debounce/throttle hot
  paths; no layout thrash in handlers.

Verify: `pnpm build`; mobile Lighthouse — report before/after TBT and
main-thread/bootup time.
