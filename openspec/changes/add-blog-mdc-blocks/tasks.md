# Tasks

Commit types follow the proposal: `refactor(community-poi)` for the shared
schema.org ids, `feat(blog)` for everything else. Before the pull request:
`pnpm test`, `pnpm build` and `pnpm quality` pass; `.nuxtrc` is restored.

## 1. Shared identifiers

- [x] 1.1 Move the POI schema.org `@id` helpers into `shared/utils/communityPoiSchema.ts` and use them in `pages/community-poi/[...slug].vue`; verified by `tests/seo/poi-place-link.spec.ts` (updated) and `tests/community` staying green

## 2. Data

- [x] 2.1 `CommunityPoiEmbed` type and `listCommunityPoiEmbedsBySlugs` in the repository interface and the Nuxt adapter; verified by `tests/content/adapter-queries.spec.ts` (IN query, projection, empty list)
- [x] 2.2 `poiEmbedSlugs` and `mdcBlockProps` walk the minimark body; verified by `tests/content-core/mdc-body.spec.ts`
- [x] 2.3 `useBlogArticle` loads the embedded POIs with the article in one `useAsyncData`; verified by `tests/content/blog-authors-query.spec.ts` (fake repository extended)

## 3. Blocks

- [x] 3.1 `Coords` (inline and block): position, translated dimension, copy of `/tp x y z`; verified by `tests/content-core/mdc-coords.spec.ts`
- [x] 3.2 `Gallery` as a wrapper over the base `MediaGallery`; verified by `tests/content-core/mdc-gallery.spec.ts`
- [x] 3.3 `PoiEmbed` card with repository lookup, unknown-slug behaviour and development warning; verified by `tests/content-core/mdc-poi-embed.spec.ts`
- [x] 3.4 `Coords` and `Gallery` added to the single-word allowance in `eslint.config.mjs` with the reason

## 4. JSON-LD

- [x] 4.1 `buildPoiMentions` in `layers/blog/utils/poiMentions.ts`, wired into `useArticleSeo` as `mentions`; verified by `tests/blog/poi-mentions.spec.ts` and a rendered post

## 5. Content

- [x] 5.1 Svenko1 posts (de, en) use `:coords`, `::poi-embed` per build and one `::gallery`; verified by `tests/content/mdc-blocks-resolve.spec.ts`
- [x] 5.2 Svenko1 posts (de, en) also use `::bluemap` for the two builds with coordinates and `::download` for the End-Portal schematic, once the sibling blocks are on `main`; verified by `tests/content/mdc-blocks-resolve.spec.ts`

## 6. Verification and pull request

- [x] 6.1 `pnpm test`, `pnpm quality` (no rise above `quality-baseline.json`) and `pnpm typecheck` (only pre-existing errors)
- [x] 6.2 `pnpm build` and a rendered `/de/blog/svenko1s-herbst-bauprojekte` checked for the block output and the JSON-LD `mentions`
- [x] 6.3 Open the pull request under the title `feat(blog): add interactive markdown blocks`
