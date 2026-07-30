# OG images with nuxt-og-image

## Contents

- [The island boundary](#the-island-boundary)
- [`defineOgImage()` v6 signature](#defineogimage-v6-signature)
- [Community templates must be ejected](#community-templates-must-be-ejected)
- [Fonts](#fonts)
- [The `zeroRuntime` prerender recipe](#the-zeroruntime-prerender-recipe)

## The island boundary

An OG image template (`components/OgImage/*.satori.vue` or `*.takumi.vue`)
renders inside an isolated Satori/Takumi island: no `useRoute()` locale
prefix, no cookies, no i18n `$t()`/messages context, and no access to
whatever composable state the calling page built up. Resolve every string the
template needs — locale, translated title, formatted date — in the page or
composable, and pass it in as a prop:

```ts
// composable — resolve locale-aware strings first
defineOgImage('NuxtSeo', {
  title: opts.title || site.name,
  description: pageDescription.value
})
```

```vue
<!-- components/OgImage/NuxtSeo.satori.vue — receives only what it's given -->
<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
```

A template that calls `useI18n()` itself either throws or silently falls back
to the default locale — it has no i18n plugin in that render context. This is
also why `components/OgImage/**` is out of `tailwind-design`'s scope: Satori
renders a fixed subset of CSS from inline styles, not through this app's
Tailwind/PostCSS pipeline, so utility classes that work in the app do not
reliably work inside a `.satori.vue` template.

## `defineOgImage()` v6 signature

```ts
defineOgImage(componentName: string, propsOrOptions?, options?)
```

The component name is the **first positional argument**. The renderer is picked
from the template file's suffix, not a `defaults.renderer` config key — the
three suffixes are `.satori.vue`, `.takumi.vue` and `.browser.vue`
(`RendererType = 'satori' | 'browser' | 'takumi'`, `dist/runtime/types.d.ts`),
and a `.satori.vue` file always renders with Satori regardless of config.

<details>
<summary>Old patterns (nuxt-og-image v5)</summary>

`defineOgImageComponent(name, props)` and passing a single
`{ component: 'X', ...props }` object are both deprecated in favour of the
signature above. `npx nuxt-og-image migrate v6` rewrites call sites
automatically.

</details>

## Community templates must be ejected

`nuxt-og-image` ships **12** ready-made templates outside this repo's
`components/OgImage/`, in `dist/runtime/app/components/Templates/Community/`:
`BlogPost`, `Brutalist`, `Docs`, `Frame`, `Nuxt`, `NuxtSeo`, `Pergel`,
`ProductCard`, `SaaS`, `SimpleBlog`, `UnJs`, `WithEmoji` (13 files —
`NuxtSeo` ships both a `.satori.vue` and a `.takumi.vue`). Don't read the
`COMMUNITY_TEMPLATES = ["NuxtSeo", "Brutalist", "SimpleBlog"]` constant in
`dist/cli.cjs` as the full list: it is only the subset the v6 migration
command scans for. Calling `defineOgImage('NuxtSeo', …)`
works in dev because the dev server can render the module's own copy on
demand, but the module's own CLI treats this as unfinished migration work —
`npx nuxt-og-image eject <name>` copies the template source into
`components/OgImage/<name>.satori.vue` in this repo, where you can edit it and
where `zeroRuntime`'s prerender pass can pick it up as a local file. See the
top-level "`zeroRuntime` has three preconditions" section — ejecting the
template is precondition 2, independent of prerendering (precondition 1).

## Fonts

No `@nuxt/fonts` module is installed in this repo, so `nuxt-og-image` falls
back to its own bundled Google Fonts pipeline (`runtime/server/og-image/fonts.js`)
to resolve `font-family` declarations used inside a template at render time.
If `@nuxt/fonts` is ever added, run `npx nuxt-og-image migrate v6` again — it
migrates a legacy `ogImage.fonts` config block into `@nuxt/fonts` config
rather than leaving two separate font-resolution paths active.

## The `zeroRuntime` prerender recipe

`zeroRuntime: true` (set in this repo's `nuxt.config.ts`) needs `nitro.prerender`
seeded with every route that calls `defineOgImage()`, not just the locale
roots — a crawl that stops at the homepage never visits `/en/blog/<slug>` and
so never generates that page's image:

```ts
// nuxt.config.ts — the single place this route list should live
nitro: {
  prerender: {
    crawlLinks: true,
    routes: ['/en', '/de'], // crawlLinks follows every discovered link from here
    failOnError: false
  }
}
```

`crawlLinks: true` makes Nitro follow every in-app link it discovers from the
seed routes, so blog and team pages are reached without listing each one by
hand — but only if they're actually linked from a crawled page. A page
reachable only via a form or client-only redirect still needs its path added
to `routes` explicitly.
