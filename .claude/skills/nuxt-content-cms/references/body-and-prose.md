# Body format and Prose overrides

## Contents

- [The body is minimark, not HTML](#the-body-is-minimark-not-html)
- [Getting plain text out of it](#getting-plain-text-out-of-it)
- [The original markdown](#the-original-markdown)
- [How a Prose override resolves](#how-a-prose-override-resolves)

## The body is minimark, not HTML

`@nuxt/content` v3 stores a parsed document's `body` as **minimark**, not HTML and
not the v2 AST tree:

```json
{ "type": "minimark", "value": [["p", {}, "some text"], ["ul", {}, ["li", {}, "item"]]] }
```

Each node is a tuple `[tag, attrs, ...children]`; children are either strings or
further tuples. `<ContentRenderer :value="doc" />` walks this to render the actual
article — see `pages/blog/[...slug].vue`. Don't hand-roll a renderer or assume
`body` is a string; it never is for a `.md` file.

## Getting plain text out of it

For anything that needs plain text (meta descriptions, card excerpts, word counts),
use `extractPlainText` from `utils/content.ts`. It already walks both the minimark
`body` shape and the older `excerpt` AST shape (`{ type, children }`), so it's the
one function that handles either without you needing to know which you have.

For a short teaser instead of full plain text, `<ContentRenderer>` takes an
`excerpt` prop that renders only the content before the `<!--more-->` marker —
see `components/features/blog/page/card/ArticleCard.vue` for
`<ContentRenderer :value="blogArticle" :excerpt="true">`.

There is **no** implicit first-paragraph fallback. `@nuxtjs/mdc`'s compiler only
sets `doc.excerpt` when it finds a `<!--more-->` comment node; with no marker the
field is `undefined`, and `ContentRenderer`'s `if (props.excerpt && props.value.excerpt)`
guard then falls through to rendering the **full body**. A post that forgets the
marker silently dumps its whole article into the card. All 15 posts under
`content/blog/` currently carry one, so this isn't biting today — check it when
adding a post.

## The original markdown

Neither `body` (minimark) nor `excerpt` gets you back the original markdown source.
The only way to keep it is to add `rawbody: z.string()` to the collection's schema —
this is a special-cased field name that `@nuxt/content` recognizes and populates
with the raw file content verbatim. No collection in this repo currently declares it.

## How a Prose override resolves

`@nuxt/content` renders every markdown element (`<p>`, `<a>`, code fences, …)
through a `Prose*` component. Fourteen real overrides of `@nuxtjs/mdc` components live
in `components/content/`: `ProseA.vue`, `ProseH1.vue`–`ProseH6.vue`,
`ProseHr.vue`, `ProseImg.vue`, `ProseLi.vue`, `ProseOl.vue`, `ProsePre.vue`,
`ProseP.vue` and `ProseUl.vue`. There is no `ProseCode.vue` override, so inline
code still renders with `@nuxtjs/mdc`'s default.

`ProseHeading.vue` and `ProseList.vue` also sit in that directory but are **not**
overrides — `@nuxtjs/mdc` ships no component of either name
(`dist/runtime/components/prose/`), so nothing in the markdown pipeline resolves
to them. They are local helpers the real overrides reuse — `ProseHeading` is
imported by `ProseH1`–`ProseH6`, `ProseList` by `ProseOl`/`ProseUl`. Renaming or
deleting one breaks those callers, not the renderer.

To add or change one:

1. Start from the original in `@nuxtjs/mdc`'s `runtime/components/prose/`, not from
   scratch — copy its `<script setup>` props verbatim (e.g. `ProseA`'s original
   takes only `href` and `target`; the override here still does).
2. Keep the exact same filename (`ProseA.vue`, `ProseCode.vue`, …) in
   `components/content/` — `@nuxt/content` matches overrides by filename.
3. Don't register it with `global: true`; the `components/content/` directory is
   already scanned by convention.

For what Tailwind classes actually belong inside a Prose override, and why code
blocks stay light-themed, see the `tailwind-design` skill.
