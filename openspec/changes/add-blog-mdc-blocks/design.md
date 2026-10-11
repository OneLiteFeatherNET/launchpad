# Design: interactive markdown blocks

## Block resolution

`@nuxtjs/mdc` renders `::name` and `:name{…}` through Vue's component
registry by PascalCase name. Components placed in `layers/content-core/components/`
resolve the same way `::event-guides` resolves from `layers/events/components/`,
so nothing is registered globally. The block name is the component name, which
is why `Coords` and `Gallery` are single-word.

Attribute syntax as the parser produces it:

- `key=value` attributes arrive as strings (`x=1161` gives `"1161"`). Props
  accept `number | string`, and the copy command is built from the string.
- YAML inside a block (`::gallery` followed by `---`) becomes a `:images`
  binding, evaluated as a JavaScript expression.
- Inline form is single-colon (`:coords{…}`). `::coords{…}` in the middle of a
  line is not parsed, so the post uses the inline form.
- A block form needs its closing `::` line, even with no children:
  `::poi-embed{slug="yggdrasil"}` followed by `::`. Without the closer the
  block swallows every following paragraph as children, and `PoiEmbed` does
  not render slot content, so the rest of the post disappears silently. This
  happened during development and is what
  `tests/content/mdc-blocks-resolve.spec.ts` now guards against.

## Data

`PoiEmbed` reads through `ContentRepository.listCommunityPoiEmbedsBySlugs`, an
`IN` query with a projection (no body, lore or gallery). The article's
`useBlogArticle` payload also carries the POIs its body embeds, so the SEO
composable needs no second query. The slugs come from the body's minimark
tree (`poiEmbedSlugs` in `layers/content-core/utils/content.ts`).

## JSON-LD

- `mentions` on the Article node: one `CreativeWork` per distinct embedded
  POI, in first-use order, with `@id` = detail URL + `#creativework`. The POI
  page emits the same `@id` from `shared/utils/communityPoiSchema.ts`, so the
  two describe one entity and nothing emits two different nodes under one id.
  An embed whose POI does not exist is not mentioned.
- Gallery images are not added to the Article `image` list. That list is for
  the article's own representative images; adding POI screenshots would make
  the rich-result image set describe the POI rather than the post.
- `::download` does not emit `associatedMedia`. Its size is free text
  (`ca. 590 KB`) with no MIME type behind it, and no rich result uses it, so
  the node would be valid but of no use to a search engine.

## Performance and accessibility

- `PoiEmbed` and `Gallery` images are `loading="lazy"` with explicit
  dimensions. Embeds sit in the body, below the title, so none is above the
  fold.
- All text, links, alternative text and coordinates are in the server HTML.
  JavaScript only adds the copy action and the lightbox.
- The copy action is a real button with an accessible name that includes the
  command. The clipboard write is `navigator.clipboard.writeText`; a missing
  clipboard API is silently ignored, and the coordinates stay visible.
- Focus rings use the shared `focus-ring` utility. `PoiEmbed` has no motion;
  the gallery's hover zoom is already disabled under `prefers-reduced-motion`
  in `MediaGallery`.

## Unknown slugs

`PoiEmbed` renders nothing for a slug that matches no POI in the locale, and
logs a warning under `import.meta.env.DEV` only. `import.meta.dev` is false
under the Vitest Nuxt environment, so the gate reads `import.meta.env.DEV`.
The content test `tests/content/mdc-blocks-resolve.spec.ts` fails for an
unknown slug in a post, so the typo is caught before it ships.

## Test strategy

Pure logic (body walker, mention builder, adapter projection) runs in Node.
Components run in the Nuxt environment with `mockNuxtImport` for the
repository and a stubbed `navigator.clipboard`. The content test checks every
block name used in `content/blog` against the component files of all layers.
