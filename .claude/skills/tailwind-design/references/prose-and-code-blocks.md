Where `@nuxt/content`'s rendered markdown gets its styling, and the one code
path that's still unstyled.

## The `Prose*.vue` overrides carry all the styling

`@nuxt/content` renders markdown through the `Prose*` component contract
(`ProseH1`–`ProseH6`, `ProseA`, `ProseP`, `ProseUl`/`ProseOl`/`ProseLi`,
`ProseHr`, `ProseImg`, `ProsePre`). `layers/content-core/components/` overrides every one
of them with real Tailwind classes — there's no separate "prose" CSS plugin
or typography plugin in this repo; markdown looks the way it does purely
because of these component files. Style markdown output by editing the
matching `Prose*.vue` file the same way you'd style any other component: real
utility classes, MD3 role and type tokens from the token contract, not
arbitrary `var()`. For how an override resolves — component discovery, why a
`ProseCode` component would need to exist to affect inline `` `code` `` — see
the `nuxt-content-cms` skill.

## `ProseCode` doesn't exist

`layers/content-core/components/` overrides `ProsePre.vue` (fenced code blocks) but has
no `ProseCode.vue`. Inline `` `code` `` spans inside prose text fall through
to `@nuxt/content`'s built-in, unstyled default — no role tokens, no
dark-mode handling. If inline code needs to match the rest of the design,
add `layers/content-core/components/ProseCode.vue`; don't assume `ProsePre.vue` covers it.

## Shiki emits both themes; `tokens.css` switches them by OS

`nuxt.config.ts`'s `content.build.markdown.highlight.theme` configures three
named themes (`default: 'github-light'`, `dark: 'github-dark'`,
`sepia: 'monokai'`). Shiki (via `@nuxtjs/mdc`) compiles every token with
`defaultColor: false`, so each span gets only CSS custom properties —
`--shiki-default`, `--shiki-dark`, `--shiki-sepia` (plus `-bg` variants).
`@nuxtjs/mdc` inlines CSS next to each code block that reads them, but scopes
the dark one to an `html.dark` **class**, which this site never sets — code
stayed in the light theme on a dark page.

`assets/css/tokens.css` fixes that with a `prefers-color-scheme: dark` rule on
`html body .shiki span`. The extra `body` matters: the generated
`html .shiki span` rule is inlined later in the document, so an equally
specific selector would lose. The code block itself sits on
`surface-container-highest` (`ProsePre.vue`).

If a class-based toggle gets built, the `.dark`-scoped rule Shiki already
emits starts working for free and the `tokens.css` override becomes
redundant.
