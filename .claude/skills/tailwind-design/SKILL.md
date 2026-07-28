---
name: tailwind-design
description: >-
  Covers styling this Nuxt site with Tailwind CSS v4 — the @theme token contract
  in assets/css/tailwind.css, which brand utility names actually compile, the
  light-dark() and dark: variant split, where custom CSS and component classes
  belong, the focus-ring convention, and how to verify a class survived the build.
  Use when adding or changing utility classes on a component, page or layout,
  adding a color, gradient, spacing or animation token, building a dark-mode
  toggle, styling markdown or Prose output and code blocks, editing tailwind.css,
  tokens.css or tailwind.config.mts, or when a utility class or focus ring appears
  to have no effect.
---

Nuxt 4.2 · @nuxtjs/seo 5.1 · @nuxtjs/i18n 10.3 · @nuxt/content 3.14 · Tailwind 4.1 · Cloudflare Workers + D1

## The token contract

`assets/css/tailwind.css`'s `@theme` block is the only source of color tokens —
`tailwind.config.mts` is never read (no `@config` directive anywhere; see below).
Every `--color-*` custom property there mints a utility named after what follows
`--color-`:

| use | never |
|---|---|
| `bg-brand-primary`, `text-brand-accent`, `border-brand-secondary` | `bg-primary`, `text-secondary`, `ring-accent` |
| `bg-secondary-cyan`, `bg-secondary-pink` (and `-orange`/`-purple`/`-blue`) | `bg-secondary`, `*-brand-500` (no numeric brand scale exists) |
| `bg-bg`, `bg-surface`, `text-text`, `text-muted`, `border-border` | `bg-background`, `text-content` (not real token names) |

There is no bare `primary`, `secondary`, or `accent` color, and no numeric
`brand-*` scale — only `--color-brand-primary/secondary/accent/orange/purple`.
33 existing class usages under `components/` and `pages/` already use the dead
names (`bg-primary` ×11, `text-primary` ×8, `ring-primary` ×6, `border-primary`
×3, `ring-secondary` ×2, `text-secondary` ×2, `border-secondary` ×1— e.g.
`components/base/Chip.vue`'s default variant). They compile to nothing and ship
invisible. Copying one of them reinforces the wrong answer — verify with the
build (see "Verify"), don't pattern-match on-repo usage for color classes.

## Arbitrary var() classes must resolve

`ring-[var(--color-secondary)]` only works if `--color-secondary` is declared
somewhere Tailwind sees — an arbitrary `var(--x)` value is not type-checked
against `@theme`. This repo defines `--color-secondary-cyan` etc. and
`--color-brand-secondary`, but never a bare `--color-secondary` — so any
`var(--color-secondary)` resolves to nothing. Fix the call site to a real
token (`ring-brand-secondary`), don't paper over it by adding a new top-level
alias to `@theme`: that would also activate the whole discouraged bare
`*-secondary` utility family this file's "never" column rules out.

## Dark mode: two mechanisms, one OS signal

Two independent things currently both track `prefers-color-scheme`, not a
class: the `light-dark()` values in `--color-bg/surface/text/muted/border`,
and every `dark:` utility, because Tailwind v4's default `dark` variant
*is* `@media (prefers-color-scheme: dark)` — there is no
`@custom-variant dark` in `tailwind.css` to override it. They only agree by
coincidence.

A class-based toggle (`<html class="dark">`) needs **both** halves changed, or
half the site stops matching the toggle:

1. `@custom-variant dark (&:where(.dark, .dark *));` right after
   `@import 'tailwindcss';` — this is what makes `dark:` respond to the class.
2. Every `light-dark(a, b)` value in `@theme` rewritten as two rules, one
   plain and one under `.dark`, since `light-dark()` itself only ever reads
   the OS setting.

Never wire the toggle through `tailwind.config.mts` — nothing loads it.

## Where custom CSS goes

This repo has zero `@apply` and zero `@layer components` — utility classes are
written inline, and hand-written CSS (`assets/css/tokens.css`, imported from
`app.vue`, not `nuxt.config.ts`) uses plain custom properties, not `@apply`.
Keep it that way: `@apply` outside the file that has `@import 'tailwindcss'`
needs its own `@reference "tailwindcss"` import, which re-resolves the whole
theme per file — real cost for a repeated build, and easy to forget in a
component's `<style scoped>` block, where it silently no-ops instead of erroring.
For a genuinely reusable class, prefer `@utility name { ... }` in
`tailwind.css` itself (participates in `@apply`/variants like a real utility,
no `@reference` needed) over `@layer components`, which v4 keeps only for
migration compatibility.

## Focus rings

`focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]` is the
pattern used across `NavigationItem.vue`, `NavigationBar.vue`, `Footer.vue`,
and `error.vue` (24 call sites) — and it's invisible everywhere, for the same
undefined-token reason as above. Use a defined ring color
(`focus-visible:ring-brand-secondary`) and always pair `focus-visible:`, never
bare `focus:`, so mouse users don't get a ring on click.

## References

- `references/theme-authoring.md` — `@theme` vs `@theme inline` vs `@theme static`, animation tokens.
- `references/v4-utility-changes.md` — the `@utility`-over-`@layer` policy and the v3→v4 syntax table.
- `references/prose-and-code-blocks.md` — styling `@nuxt/content` output, the missing `ProseCode` override, Shiki's dual-theme trap.

## Verify

A class can look right and still not exist in the compiled CSS — ESLint
doesn't check Tailwind class names, and the build succeeds either way:

1. `pnpm build`
2. `grep -o '\.ring-brand-secondary{' .output/public/_nuxt/*.css` (swap in the
   exact class you added, dot-prefixed, brace-terminated, no `.output/`
   shortcuts — `dist/` doesn't exist for this Cloudflare build)
3. Nothing found means the class never compiled — the token isn't in `@theme`,
   or the class name doesn't match a real token. Fix one of those and rebuild.
4. Repeat until the grep finds your class.
