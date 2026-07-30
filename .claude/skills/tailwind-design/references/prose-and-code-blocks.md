Where `@nuxt/content`'s rendered markdown gets its styling, and the one code
path that's still unstyled.

## The `Prose*.vue` overrides carry all the styling

`@nuxt/content` renders markdown through the `Prose*` component contract
(`ProseH1`–`ProseH6`, `ProseA`, `ProseP`, `ProseUl`/`ProseOl`/`ProseLi`,
`ProseHr`, `ProseImg`, `ProsePre`). `components/content/` overrides every one
of them with real Tailwind classes — there's no separate "prose" CSS plugin
or typography plugin in this repo; markdown looks the way it does purely
because of these component files. Style markdown output by editing the
matching `Prose*.vue` file the same way you'd style any other component: real
utility classes, brand tokens from the token contract, not arbitrary
`var()`. For how an override resolves — component discovery, why a
`ProseCode` component would need to exist to affect inline `` `code` `` — see
the `nuxt-content-cms` skill.

## `ProseCode` doesn't exist

`components/content/` overrides `ProsePre.vue` (fenced code blocks) but has
no `ProseCode.vue`. Inline `` `code` `` spans inside prose text fall through
to `@nuxt/content`'s built-in, unstyled default — no brand tokens, no
dark-mode handling. If inline code needs to match the rest of the design,
add `components/content/ProseCode.vue`; don't assume `ProsePre.vue` covers it.

## Shiki emits both themes; nothing switches between them by OS

`nuxt.config.ts`'s `content.build.markdown.highlight.theme` configures three
named themes (`default: 'github-light'`, `dark: 'github-dark'`,
`sepia: 'monokai'`). Shiki (via `@nuxtjs/mdc`) compiles every token with
`defaultColor: false`, so each span gets only CSS custom properties —
`--shiki-default`, `--shiki-dark`, `--shiki-sepia` (plus `-bg` variants) — no
plain `color`/`background` fallback. `@nuxtjs/mdc` does auto-generate the CSS
that reads them, inlined as a `<style>` tag next to each code block, but that
CSS is scoped with **class** selectors — `html.dark .shiki span`, not a
`prefers-color-scheme` media query. Nothing in this app ever puts a `.dark`
class on `<html>` (see "Dark mode" in `SKILL.md`), so that rule never
matches: code blocks always render `--shiki-default` (the light GitHub
theme), even when the rest of the page is following OS dark mode via
`light-dark()`.

To make code blocks actually follow the OS instead, add a manual rule —
don't rely on the auto-generated `.dark`-class CSS:

```css
@media (prefers-color-scheme: dark) {
  .shiki span {
    color: var(--shiki-dark);
    background: var(--shiki-dark-bg);
  }
}
```

If a class-based toggle gets built (see `SKILL.md`'s "Dark mode" section),
the existing `.dark`-scoped rule Shiki already emits starts working for free
and this override becomes redundant.
