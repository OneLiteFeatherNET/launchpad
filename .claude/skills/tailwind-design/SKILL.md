---
name: tailwind-design
description: >-
  Covers styling this Nuxt site with Tailwind CSS v4 and its Material Design 3
  design system — the MD3 colour roles and scales in assets/css/tailwind.css,
  the M3* primitives in layers/base, the governance tests that reject raw
  colours, off-scale radii/shadows and hand-built buttons, the light/dark
  mechanism, where custom CSS belongs, and how to verify a class compiled. Use
  when adding or changing utility classes on a component, page or layout,
  adding or regenerating a token, building a button, card, chip or other
  control, styling markdown/Prose output or code blocks, editing tailwind.css
  or tokens.css, or when a class, colour or focus ring appears to have no
  effect.
---

Nuxt 4.4 · Tailwind 4 · Material Design 3 (tokens + own primitives, no
component library) · OpenSpec change `adopt-md3-design-system`

## The token contract

`assets/css/tailwind.css`'s `@theme` block is the only source of tokens —
there is no `tailwind.config`. Every `--color-*` there mints utilities named
after what follows `--color-`.

**Colour = MD3 roles.** `primary`, `on-primary`, `primary-container`,
`on-primary-container`, the same four for `secondary`, `tertiary`, `error`
and the custom colours `brand-orange` / `brand-purple`, plus `surface`,
`surface-dim`, `surface-bright`, `surface-container-lowest` … `-highest`,
`on-surface`, `on-surface-variant`, `outline`, `outline-variant`,
`inverse-surface`, `inverse-on-surface`, `inverse-primary`, `scrim`,
`shadow`. Pair a background role with its `on-` role and the contrast is
guaranteed in both schemes (`contrast.spec.ts` checks every pair).

| use | never |
|---|---|
| `bg-surface-container-high text-on-surface` | `bg-white`, `text-gray-700`, `bg-neutral-900` |
| `bg-primary text-on-primary`, `border-outline-variant` | `bg-[#2A388F]`, `text-[var(--color-…)]` |
| `bg-secondary-container/40` (opacity modifier is fine) | `text-muted`, `bg-brand-500`, `bg-secondary-cyan` (removed) |

**The roles are generated, not written.** `scripts/md3-tokens.mjs` computes
them with `@material/material-color-utilities` (pinned 0.3.0 — 0.4.0 does not
load from Node ESM) from the core colours `#2A388F` / `#27A9E1` / `#EC008B`
(Fidelity, contrast 0) and writes the block between `md3:generated:start` and
`md3:generated:end`. Never edit those lines by hand — change the script's
inputs and run `node scripts/md3-tokens.mjs`; `md3-tokens.spec.ts` fails on
any drift.

**Scales.** Type: `text-display-large` … `text-label-small` (15 styles, each
sets size, line height, weight, tracking). Shape: `rounded-extra-small`,
`-small`, `-medium`, `-large`, `-extra-large`, plus `rounded-none` /
`rounded-full` — Tailwind's own `rounded-md`/`-lg`/`-xl` are off-scale.
Elevation: `shadow-elevation-0` … `-5`, or `shadow-none`. Motion:
`ease-standard`, `ease-emphasized` (+ `-accelerate`/`-decelerate`) with
`duration-150` / `duration-300`.

**Utilities** (`@utility` in `tailwind.css`): `state-layer` (content colour at
8 % hover, 10 % focus/press, 0 % disabled, drawn as a background image — do
not put it on an element with its own background image), `focus-ring`
(3 px `secondary` outline, 2 px offset, keyboard focus only), `touch-target`
(hit area ≥ 48 × 48 px).

Raw brand colours for pure decoration (the connect box's glow) live as
`--brand-magenta` / `--brand-cyan` in `:root`, deliberately outside `@theme`
so they mint no utilities. The brand gradients (`--gradient-*`) and the
`.text-gradient-*` classes in `tokens.css` stay for gradient text.

## Build with the primitives

`layers/base/components/`: `M3Button` (filled, tonal, outlined, text,
elevated), `M3IconButton` (standard, filled, tonal, outlined; required
`label`; toggle via `selected`), `M3Chip` (assist, filter, suggestion, and
`kind="label"` for tags/statuses with a role `color` or `neutral`), `M3Card` +
`M3CardLink` (one stretched link per clickable card), `M3Divider`,
`M3LinearProgress` (required `label`). Pass `to` for an internal route, `href`
for an external one; `target="_blank"` gets `rel` automatically.

Callers add layout classes only (spacing, width, placement). Colour, shape,
type and state come from props. Two text colours on one element are settled
by stylesheet order, not class order — never add a colour class on top of a
primitive's, and in shared class lists keep structure and colour state apart
(see `layers/navigation/utils/navItemClasses.ts`).

A class list shared by several components of one domain goes into that
layer's `utils/` (`home/utils/carouselClasses.ts`,
`community-poi/utils/poiCalloutClasses.ts`); something domain-free belongs in
`layers/base`.

## Governance — what the tests reject

`tests/design-system/md3-governance.spec.ts` scans every `.vue` outside
`layers/base` and fails on: a colour utility that is not a role (`palette`),
a `dark:` variant on a colour/shadow/opacity utility (`dark-colour`), an
off-scale radius (`shape`) or shadow (`elevation`), and a `<button>` or
button-styled link with its own colour/shape/shadow (`button`). Comments are
ignored. Deliberate raw buttons are registered in `BUTTON_EXCEPTIONS` with a
reason (carousel and sponsor dots, the language-menu trigger).

Limit: the button rule resolves `:class` identifiers only to constants in the
same file — classes imported from another file are invisible to it. Register
a deliberate case anyway.

`dead-color-tokens.spec.ts` fails on any colour-shaped class Tailwind cannot
resolve (`bg-surface-contaner`), so a typo cannot ship invisible.

## Dark mode: one signal

Every role is a `light-dark()` pair, and `:root` has `color-scheme: light
dark`, so the OS preference switches all of them with no `dark:` variant at
the call site. Do not add `dark:` colour variants — the governance test
rejects them. A later class-based toggle needs only `.dark { color-scheme:
dark }` (and `@custom-variant dark` if any structural `dark:` remains).

Code blocks: Shiki emits both themes as custom properties, but `@nuxtjs/mdc`
switches only under an `html.dark` class the site never sets; a
`prefers-color-scheme` rule in `tokens.css` does it instead. See
`references/prose-and-code-blocks.md`.

## Where custom CSS goes

Utilities inline in templates or in class constants. A reusable class is an
`@utility` in `tailwind.css` (participates in variants, needs no
`@reference`), not `@layer components` and not `@apply` in a component's
`<style>` — that needs `@reference "tailwindcss"` and fails the build for any
theme-token class without it. Hand-written CSS (skip link, gradient text,
reduced motion, Shiki) lives in `assets/css/tokens.css`.

## Focus

Use `focus-ring`. Inside a container that clips overflow (menus) draw it
inside: `focus-visible:outline-3 focus-visible:-outline-offset-3
focus-visible:outline-secondary`. Never a bare `focus:` ring.

## References

- `references/theme-authoring.md` — `@theme` vs `@theme inline` vs `@theme static`, animation tokens.
- `references/v4-utility-changes.md` — the `@utility`-over-`@layer` policy and the v3→v4 syntax table.
- `references/prose-and-code-blocks.md` — styling `@nuxt/content` output, `ProseCode`, Shiki.

## Verify

Fastest: `tests/helpers/theme.ts` compiles the real `tailwind.css` —
`resolveCandidates(['bg-surface-container-high'])` returns the CSS or `null`,
`compileUtilities([...])` the full output. Or the build:

1. `pnpm build`
2. `grep -o '\.<your-class>{' .output/public/_nuxt/*.css`
3. Nothing found means the class never compiled — the token is not in
   `@theme` or the name does not match one.

Trap: Tailwind's content scan reads every non-gitignored file, including this
skill's Markdown, so a class merely quoted here compiles whether or not a
component uses it. Trust the grep only for a name that appears nowhere else.
