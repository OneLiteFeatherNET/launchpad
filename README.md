# OneLiteFeather Blog / Site

Multilingual (de/en) Nuxt site with @nuxt/content, SEO/i18n, and feature-based components.

## Stack
- Nuxt 3 + TypeScript, Tailwind CSS
- @nuxt/content for Markdown/data collections (blog, sponsors, timeline, etc.)
- @nuxtjs/i18n, @nuxtjs/seo, @nuxtjs/sitemap, nuxt-schema-org
- FontAwesome (brands/solid) + @nuxt/image (Cloudflare provider)

## Project Structure
- `content/` — localized collections (`blog_{locale}`, `sponsors_{locale}`, etc.)
- `layers/<domain>/` — one Nuxt layer per domain: `base` (shared primitives —
  buttons, typography, icons), `content-core`, `blog`, `community-poi`,
  `team`, `home`, `sponsoring`, `opencollective`, `navigation`, `footer`. Each
  layer holds its own `components/`, `composables/`, `utils/` and `types.ts`.
- `layouts/` — shared layout chrome
- `pages/` — route-driven pages
- `i18n/locales/` — locale message files

## Scripts
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`
- Generate (SSG): `pnpm generate`

## Content authoring
- Blog posts live under `content/blog/{locale}/`. Frontmatter supports `title`, `description`, `slug`, `pubDate`, `canonical`, `alternates`, `sitemap`, etc.
- Sponsors: `content/sponsors/{locale}/home.json` supports `name`, `url`, `description`, `badge`, plus optional `logo` (URL) or `icon` (`"fab cloudflare"` style).
- Schema for all collections lives in `content.config.ts`.

## SEO / i18n
- `usePageSeo` + `useHomeSeo` provide canonical/hreflang and social meta.
- Sitemap is auto-generated with i18n-aware content source and alternates.
- Schema.org via `nuxt-schema-org`; site config from `nuxt.config.ts`.

## Releases
- Semantic-release on main with conventional commits. Run `pnpm release` (with push access) to publish tags/changelog.
- Footer version is pulled from `package.json` (`appConfig.version`).

## Contributing
- Use 2-space indentation and `<script setup lang="ts">`.
- Prefer domain components under `layers/<domain>/components/` and shared primitives in `layers/base/components/`.
- Keep diffs small; follow existing naming (`PascalCase.vue`, route-based pages).
