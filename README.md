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
- Preview: `pnpm preview` (`nuxt preview`)
- Serve the build in workerd via wrangler: `pnpm preview:prod` (port 8787; run `NODE_ENV=production pnpm build` first)
- Tests: `pnpm test`; lint: `pnpm lint`; types: `pnpm typecheck`

## Content authoring
- Blog posts live under `content/blog/{locale}/`. Frontmatter supports `title`, `description`, `slug`, `pubDate`, `canonical`, `alternates`, `sitemap`, etc.
- Sponsors: `content/sponsors/{locale}/home.json` supports `name`, `url`, `description`, `badge`, plus optional `logo` (URL) or `icon` (`"fab cloudflare"` style).
- Schema for all collections lives in `content.config.ts`.

## SEO / i18n
- `usePageSeo` + `useHomeSeo` provide canonical/hreflang and social meta.
- Sitemap is auto-generated with i18n-aware content source and alternates.
- Schema.org via `nuxt-schema-org`; site config from `nuxt.config.ts`.

## Deployment
- The site runs as the Cloudflare Worker `launchpad` (Nitro preset `cloudflare_module`, SSR), deployed by Cloudflare Workers Builds from the Git integration — not by GitHub Actions. Production branch is `main`.
- There is no `wrangler.toml`: Nitro generates the wrangler config from `nuxt.config.ts` (`$production.nitro.cloudflare`, `deployConfig: true`). The D1 binding `DB` backs @nuxt/content.
- Images are served through Cloudflare Images at `img.onelitefeather.net`. `NUXT_IMAGE_PROVIDER` and `WORKERS_CI` are build-time variables in Workers Builds.
- Pull request previews come from Workers Builds preview URLs.
- `pnpm generate` (SSG) is not part of the deployment path. See `AGENTS.md` (Deploy) for the required Workers Builds settings.

## Releases
- Releases are managed by [release-please](https://github.com/googleapis/release-please) (`.github/workflows/release-please.yml`, `release-please-config.json`). Commits on `main` follow Conventional Commits; release-please keeps a release PR up to date with the version bump and `CHANGELOG.md`.
- Merging the release PR tags the release and publishes the GitHub Release; the workflow then fast-forwards the `release` branch to the tag.
- Footer version is pulled from `package.json` (`appConfig.version`).

## Contributing
- Use 2-space indentation and `<script setup lang="ts">`.
- Prefer domain components under `layers/<domain>/components/` and shared primitives in `layers/base/components/`.
- Keep diffs small; follow existing naming (`PascalCase.vue`, route-based pages).
