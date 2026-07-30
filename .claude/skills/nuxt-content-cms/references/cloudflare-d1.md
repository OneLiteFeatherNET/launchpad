# @nuxt/content on Cloudflare Workers + D1

The production build (`nitro.preset: 'cloudflare_module'`, set under `$production`
in `nuxt.config.ts`) does not store content in a bundled SQLite file. It ships the
collection data as a compressed dump and replays it into a D1 database at request
time. `compatibilityDate: '2025-05-15'` in `nuxt.config.ts` is a
Workers-static-assets requirement, not a D1 one — don't cite it as the D1 floor.

## The binding name is hardcoded to `DB`

`nitro.cloudflare.wrangler.d1_databases` declares the binding:

```ts
d1_databases: [{ binding: 'DB', database_name: 'launchpad', database_id: '...' }]
```

`@nuxt/content` never reads that block — there is no `d1_databases` or `wrangler`
reference anywhere in its `dist/`. Its Cloudflare preset assigns
`{ type: 'd1', bindingName: 'DB' }` as a **literal** (`dist/module.mjs`,
`cloudflare` preset `setupNitro`). Rename the wrangler binding to anything else
and content breaks in production while the build stays green. If you must use a
different binding name, the wrangler side is not the lever — treat `DB` as fixed.

The D1 connector (`db0/connectors/cloudflare-d1`) resolves the binding lazily,
only when a query runs, so a missing binding does **not** fail the build. It
fails on the **first query** at runtime with (note the backticks):

```
[db0] [d1] binding `DB` not found
```

## `content.database` gets overridden, not respected

Setting `content: { database: { type: 'sqlite' } } }` for local dev is normal and
expected — but if that same value leaks into a Cloudflare deploy, the `cloudflare`
Nitro preset force-overrides it:

```
[@nuxt/content] WARN  Deploying to Cloudflare requires using D1 database,
switching to D1 database with binding `DB`.
```

This is a `logger.warn`, not an error — the build still succeeds, silently using D1
regardless of what `content.database` said. Don't rely on a build failure to catch
a database misconfiguration for Cloudflare; check the logs.

## Cold starts replay the dump

Each collection's SQL is exposed at `/__nuxt_content/<collection>/sql_dump.txt`
(gzip+base64 of a JSON array — see the `Verify` loop in `SKILL.md` for how to read
it). The checksum lives in `_content_info`'s **`version`** column, compared against
the build's `integrityVersion`. The sibling **`ready`** column is not a checksum at
all — it is a concurrency latch that a second concurrent request polls
(`waitUntilDatabaseIsReady`, 90 × 1 s) while the first request is still replaying.
On a request where `version` doesn't match (a fresh D1 instance, or after a deploy
that changed content), the Worker fetches the dump and replays it into D1 before
answering the query. That
adds latency to whichever request triggers it. Prerender everything you can (blog
posts, static pages) so real users hit a cached response instead of a cold
content-restore path; only routes that must read `queryCollection` at request time
pay this cost.
