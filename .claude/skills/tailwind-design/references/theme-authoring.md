Extending `assets/css/tailwind.css`'s `@theme` block — when to reach for the
plain form versus `@theme inline` or `@theme static`.

## `@theme` must be top level

`@theme { ... }` only registers tokens when it appears at the root of the
stylesheet, next to `@import 'tailwindcss'` — never nested inside a selector
like `.dark { @theme { ... } }`. Nesting it doesn't error, it just doesn't
register anything; Tailwind's build step looks for `@theme` blocks before any
selector context exists. This repo's whole token set already lives in one
top-level block in `assets/css/tailwind.css` — keep new tokens there, not in
`tokens.css` (that file is hand-written CSS consumed via `app.vue`'s
`<style>` import, not part of the `@theme` contract at all).

## Plain `@theme` — the default

Use this for anything with a literal value: `--color-brand-purple: #91268F;`,
a new spacing step, a new font size. This is what every token in
`tailwind.css` uses today except the `light-dark()` neutrals, and it's the
right default for a new color or spacing token too.

## `@theme inline` — when the value is itself a `var()`

If a token's value references another custom property —
`--color-something: var(--some-other-var);` — declare it under `@theme inline`
instead of plain `@theme`. Plain `@theme` copies the *reference* into every
generated utility (`background-color: var(--color-something)`, which then
re-resolves `--some-other-var` at paint time); `@theme inline` resolves it once
at build time and inlines the result, which matters when `--some-other-var`
is scoped somewhere Tailwind's utility output can't see it (e.g. supplied by
a JS library or a `:root` block outside the `@theme` compilation unit).
Nothing in this repo needs this today — the `light-dark()` neutrals
(`--color-bg`, `--color-surface`, etc.) are plain `@theme` because
`light-dark()` is a CSS function value, not a variable reference.

## `@theme static` — force-keep an unreferenced token

Tailwind v4 only emits the CSS variables that some utility class in your
templates actually uses; anything else is tree-shaken from the compiled
output. If a token is consumed only through an arbitrary value
(`bg-[var(--my-token)]`) or read from JavaScript (`getComputedStyle`), the
static scanner may not see the connection and drop it. Mark that token
`@theme static` to force it into the output regardless of whether a
class-name reference was detected.

## Animation tokens

Define custom animations as a `--animate-*` variable plus a matching
`@keyframes` block, both inside `@theme`:

```css
@theme {
  --animate-fade-in: fade-in 0.3s ease-out;
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

This mints an `animate-fade-in` utility. Don't split the `@keyframes` out
into a separate top-level rule — nesting it in `@theme` is what ties it to
the token.

## A token should exist only if it mints a utility

`@theme`'s job is registering values that generate utility classes. If a
custom property is only ever consumed by hand through `var()` in bespoke CSS
and never through a Tailwind class, it doesn't belong in `@theme` — a plain
`:root { --my-value: ...; }` works identically without asking the scanner to
track it. This repo's `--gradient-from`, `--gradient-via`, `--gradient-to`,
and the four `--gradient-brand*`/`--gradient-accent*` entries are exactly
this case: there is no `--gradient-*` utility namespace in Tailwind v4 (unlike
`--color-*`), so none of them mint a class — they're read only by the
hand-written `.text-gradient-brand` etc. rules in `tokens.css`. Don't copy
this as the pattern for a new token; it works only because those rules exist
by hand.
