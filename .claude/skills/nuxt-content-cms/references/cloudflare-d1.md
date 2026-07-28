# @nuxt/content on Cloudflare Workers + D1

The production build (`nitro.preset: 'cloudflare_module'`, set under `$production`
in `nuxt.config.ts`) does not store content in a bundled SQLite file. It ships the
collection data as a compressed dump and replays it into a D1 database at request
time. `compatibilityDate` must be `>= 2024-09-19` for the D1 connector to work;
this repo's `compatibilityDate: '2025-05-15'` already satisfies that.

## The binding

`nitro.cloudflare.wrangler.d1_databases` declares the binding:

```ts
d1_databases: [{ binding: 'DB', database_name: 'launchpad', database_id: '...' }]
```

`@nuxt/content` reads this as `content.database.bindingName` (defaulting to the
`binding` value if `bindingName` isn't set separately). The D1 connector
(`db0/connectors/cloudflare-d1`) resolves the actual binding lazily, only when a
query runs — so a missing or misspelled binding does **not** fail the build. It
fails on the **first query** at runtime, with `[db0] [d1] binding "DB" not found`.
If content suddenly 500s in production but the build was green, check the binding
name first.

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
(gzip, base64-encoded — see the `Verify` loop in `SKILL.md` for how to read it). On
a request where the D1 table's `_content_info.ready` row doesn't match the current
content checksum (a fresh D1 instance, or after a deploy that changed content), the
Worker fetches that dump and replays it into D1 before answering the query. That
adds latency to whichever request triggers it. Prerender everything you can (blog
posts, static pages) so real users hit a cached response instead of a cold
content-restore path; only routes that must read `queryCollection` at request time
pay this cost.
