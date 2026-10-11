# Proposal: interactive markdown blocks for blog posts

Ships as `feat(blog)`: one Conventional Commits type and scope. The
supporting `refactor(community-poi)` commit that moves the schema.org POI
identifiers into `shared/utils` is a separate commit in the same pull request.

## Why

Blog posts about community builds repeat the same facts by hand: coordinates
as plain text, a link to the POI page, a picture series with no lightbox. The
POI pages already have the components for this, but a post cannot reach them.
Authors need short, typed blocks, and search engines should see that a post
is about a POI that has its own entity.

## What Changes

- **Three blocks** available to every blog post, without global registration
  (same mechanism as `::event-guides`):
  - `::poi-embed{slug="…"}` renders a server-side card for a community POI in
    the current locale: thumbnail, status, progress (unfinished builds only),
    builders, coordinates with a copy action, and a link to the POI page.
  - `:coords{x y z}` (inline) or `::coords{…}` (block) shows coordinates and a
    copy action for `/tp x y z`.
  - `::gallery` takes its images as YAML props and renders the base
    `MediaGallery` with a lightbox.
- **JSON-LD:** the Article node of each post gets `mentions`, one
  `CreativeWork` per embedded POI, with the same `@id` the POI page emits.
- **Svenko1 posts (de, en)** use the three blocks.
- **Repository:** `listCommunityPoiEmbedsBySlugs` returns the card fields only.

## Blocks from sibling pull requests

- `::bluemap{…}` (click-to-load BlueMap facade, moved into `layers/base`) and
  `::download{…}` (schematic card on `ResourceList`) were merged to `main` in
  their own pull requests. This change rebases onto them and uses both in the
  Svenko1 posts.
- Gallery images are not added to the Article `image` list (see design.md).

## Impact

- New components in `layers/content-core/components/`: `PoiEmbed`, `Coords`,
  `Gallery`. Names are unique across layers, and `Coords` and `Gallery` are
  added to the single-word allowance in `eslint.config.mjs`.
- `layers/blog/composables/useBlogContent.ts` loads the embedded POIs with the
  article in one `useAsyncData`; `useArticleSeo` takes them as a third
  argument.
- Two content files change; no schema change, no new dependency.
