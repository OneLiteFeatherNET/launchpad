Extending `assets/css/tailwind.css`'s `@theme` block — when to reach for the
plain form versus `@theme inline` or `@theme static`.

## `@theme` must be top level

Keep `@theme { ... }` at the root of the stylesheet, next to
`@import 'tailwindcss'` — never nested inside a selector like
`.dark { @theme { ... } }`.

The reason is not that nesting fails to register. On the installed 4.3.0 it
registers *and works*, which is worse: the token is hoisted into
`@layer theme { :root, :host { … } }` and the utility compiles, while the
`.dark` selector you wrapped it in is **silently discarded**. So
`.dark { @theme { --color-x: … } }` gives you a global `--color-x`, not a
dark-mode-scoped one, with no warning. To scope a value to a selector, write a
plain CSS declaration in that selector (or use `light-dark()` — see
`SKILL.md`'s dark-mode section), not a nested `@theme`.

This repo's whole token set already lives in one top-level block in
`assets/css/tailwind.css` — keep new tokens there, not in `tokens.css` (that
file is hand-written CSS consumed via `app.vue`'s `<style>` import, not part of
the `@theme` contract at all).

## Plain `@theme` — the default

Use this for anything with a literal value: a new spacing step, a new font
size, a shape or elevation step. Colours are the exception — the MD3 roles are
generated as `light-dark()` pairs by `scripts/md3-tokens.mjs` between the
`md3:generated` markers; add a colour by changing that script's inputs, never
by writing a `--color-*` line by hand.

## `@theme inline` — when the value is itself a `var()`

If a token's value references another custom property —
`--color-something: var(--src);` — declare it under `@theme inline` instead of
plain `@theme`. The difference is one level of indirection, not build-time
resolution:

| | emitted in `@layer theme` | emitted utility |
|---|---|---|
| `@theme` | `--color-something: var(--src)` | `background-color: var(--color-something)` |
| `@theme inline` | *nothing* | `background-color: var(--src)` |

`@theme inline` does **not** resolve `--src` to a literal at build time — it
substitutes the raw `var(--src)` straight into the utility, so resolution still
happens in the browser, per element, against whatever `--src` is in scope there.
That is exactly what you want when `--src` is redefined per subtree (a `.dark`
block, a component wrapper): the plain form would resolve `--color-something`
once from wherever *it* was declared, flattening the override. Nothing in this
repo needs it today — the `light-dark()` roles (`--color-surface`,
`--color-on-surface`, …) are plain `@theme` because `light-dark()` is a CSS
function value, not a variable reference.

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
track it. There is no `--gradient-*` utility namespace in Tailwind v4 (unlike `--color-*`),
so none of this repo's four `--gradient-*` entries mint a class.
`--gradient-brand`, `--gradient-accent`, `--gradient-brand-light` and
`--gradient-accent-light` are read by the hand-written `.text-gradient-*`
rules in `tokens.css`. They work, but only because those rules exist by hand —
don't copy this as the pattern for a new token. The raw brand colours used
only for decoration (`--brand-magenta`, `--brand-cyan`) follow the rule above
and sit in `:root`, not `@theme`.
