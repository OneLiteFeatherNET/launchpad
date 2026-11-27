# Tasks

Test first, then code. Tests follow F.I.R.S.T.: no network, no sleeps, no wall
clock (fake timers, injected idle callback), fresh fixtures per test.
Component tests use `// @vitest-environment happy-dom` or `nuxt` per
`CLAUDE.md`. Heavy jobs go through `heavy`. Branch from current `origin/main`
that contains this proposal. Do not commit `.nuxtrc` churn.

## 1. Baseline

- [ ] 1.1 Build with `NODE_ENV=production pnpm build`, run `pnpm preview:prod`; Lighthouse mobile with `--throttling-method=devtools`, three runs, median, on `/en` and `/de/blog`; record LCP, FCP, TBT
- [ ] 1.2 Record modulepreloaded JS on `/en` (baseline ~506 KB raw / 50 chunks) and the entry graph via a bundle analyser

## 2. Carousel loads only the current slide's image

- [ ] 2.1 Tests (red): server markup has an `img` only in slide 0; next slide armed on idle; navigation before idle arms it; autoplay waits for an armed slide; one preload with `fetchpriority="high"`; slide box size unchanged
- [ ] 2.2 Implement in `Carousel.vue` and `CarouselItem*.vue`; alt texts stay on the rendered image
- [ ] 2.3 Commit `perf(lcp): load only the current carousel slide image`

## 3. Navigation logo from public/

- [ ] 3.1 Test (red): the logo `img` src is the same-origin `/images/...` path (default and seasonal `logoSrc`), with width and height
- [ ] 3.2 Implement in `NavigationBar.vue`: plain `<img>` instead of `NuxtImg`
- [ ] 3.3 Commit `perf(lcp): serve the navigation logo from the site origin`

## 4. Fewer modulepreloaded scripts

- [ ] 4.1 Read `perf-critical-render-path/design.md` decisions 3 and 4 and reuse them; measure which chunks `/en` needs for first paint
- [ ] 4.2 Tests (red): pure trim function with a handmade manifest; lower `PRELOADED_SCRIPTS_BUDGET_BYTES` in `tests/performance/entry-chunk-budget.spec.ts` (extend, do not duplicate)
- [ ] 4.3 Implement the `build:manifest` hook in `nuxt.config.ts` calling the pure function
- [ ] 4.4 Survey `IconFa` / `iconRegistry.ts` usage; move to per-component icon imports and adapt `tests/architecture/fontawesome-registry.spec.ts`; skip if the gain is under ~5 KB and record that
- [ ] 4.5 Hydrate the cookie-consent banner lazily (`hydrate-on-idle`); test that SSR markup and dialog semantics remain
- [ ] 4.6 Re-measure the entry graph; record the numbers here and confirm the budget test passes
- [ ] 4.7 Commit `perf(lcp): trim modulepreload and entry icons on the home page`

## 5. Field data

- [ ] 5.1 Two weeks after release, re-export Cloudflare Web Analytics p75 (LCP, FCP) and compare with the 30 Oct - 27 Nov baseline, which mostly predates 1.43.0/1.44.x

## 6. Verify

- [ ] 6.1 `heavy pnpm build`, `heavy pnpm quality` (baseline does not rise), `heavy pnpm test`, `pnpm typecheck`
- [ ] 6.2 Repeat 1.1 and 1.2 after the changes; record before/after LCP, FCP, TBT and preload bytes in this change. Carousel images 404 locally: use `NUXT_IMAGE_PROVIDER=cloudflare` or measure production after release

## 7. Pull request

- [ ] 7.1 Open the code pull request titled `perf(lcp): cut bandwidth contention for the hero image on mobile` (implementation only, no files under `openspec/`; English description as a short domain story, no session links)
