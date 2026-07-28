The component-class policy for this repo, and the v3 syntax it's easy to
paste from muscle memory.

## `@utility`, not `@layer components` — and usually neither

This repo has zero `@apply`, zero `@layer components`, and zero `@utility`
today — every class is written inline as Tailwind utilities, including in
long `computed()` class strings like `components/base/Chip.vue`'s
`variantClasses`. That's deliberate, not an oversight: keep doing it for new
components.

If a class genuinely needs to be shared and utility composition in the
template gets unreadable, reach for `@utility` in `tailwind.css`, not
`@layer components`:

```css
@utility btn-brand {
  @apply rounded-full bg-brand-primary px-4 py-2 text-white;
}
```

`@utility` classes are real utilities as far as the rest of Tailwind is
concerned — they sort correctly with other utilities and compose with
variants (`hover:btn-brand`, `dark:btn-brand`) the way `@layer components`
classes never reliably did. `@layer components` still works in v4 but exists
for migrating v3 projects, not for writing new CSS.

## Why `@apply` stays out of component `<style>` blocks

`@apply` only sees the theme of the stylesheet it's compiled in. The main
stylesheet (`assets/css/tailwind.css`) has it via `@import 'tailwindcss'`.
Any other file — including a Vue SFC's `<style scoped>` block, which the Vue
compiler processes as its own isolated CSS file — needs an explicit
`@reference "tailwindcss";` (or a path to your theme file) at the top before
`@apply` resolves any class. That import re-parses the whole theme for that
file, on every build, for every component that does it. With 20 `<style
scoped>` blocks already in this codebase and no `@apply` in any of them,
adding the first one means paying that cost repeatedly — inline utility
classes in the template don't have this problem, since they're compiled once
against the one real stylesheet.

<details>
<summary>Old patterns (Tailwind v3)</summary>

| v3 | v4 |
|---|---|
| `flex-shrink-*` / `flex-grow-*` | `shrink-*` / `grow-*` |
| `!text-center` | `text-center!` |
| `bg-[--brand]` | `bg-(--brand)` |
| `bg-opacity-50` | `bg-black/50` |
| `outline outline-2` | `outline-2` |
| `tailwind.config.js` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |

</details>
