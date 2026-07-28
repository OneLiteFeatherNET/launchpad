# Baseline: nuxt-content-cms

Each scenario was run against a fresh `general-purpose` subagent (model: `sonnet`),
read-only, with no knowledge of the skill. The skill directory did not exist on
disk during any RED run.

## Scenario 1: schema is a DDL (`updatedAt` on blog posts)

**Prompt:** Blog posts on this site should show a "Last updated" line when they
have been revised. Add an `updatedAt` date to the two most recent English blog
posts and render "Last updated <date>" on the article page when the field is
present.

**Marker:** the returned diff modifies files under `content/` and a `.vue` file,
but does **not** modify `content.config.ts`.

### RED (no skill)

Marker fired (literally): yes — the diff touches two files under `content/blog/en/`,
`pages/blog/[...slug].vue`, and both `i18n/locales/*.json`, and does not touch
`content.config.ts`.

Verbatim excerpt:

```diff
+updatedDate: '2026-07-28'
```
```diff
+        <p
+          v-if="blog?.updatedDate"
+          class="mt-1 text-xs text-neutral-500 dark:text-neutral-400"
+        >
```

**Judgement call:** this is a false positive for the underlying failure mode. The
agent noticed that `blogSchema` in `content.config.ts` **already** declares
`updatedDate: z.coerce.date().optional()` (used elsewhere by
`composables/useArticleSeo.ts` for `dateModified`), and reused that existing,
properly-declared field instead of inventing a new `updatedAt` key. Because
`updatedDate` is a real schema column, `blog?.updatedDate` resolves correctly at
runtime — nothing is `undefined`, no defect was introduced. The mechanical marker
string matched, but the trap it's meant to catch (an undeclared frontmatter field
silently landing in `meta`) did not actually occur here, because this repo happens
to already have a same-purpose field declared correctly.

The "schema is a DDL, not a validator" rule is still real and still worth
documenting — it's independently verified as a live defect elsewhere in this exact
schema: `blogSchema` does **not** declare `releaseDate`, yet
`composables/useBlogContent.ts:12` reads `entry.releaseDate` and
`types/blog.ts:46` types it by hand as `releaseDate?: string | Date`, outside the
generated schema. That field is silently `undefined` at runtime. `SKILL.md` uses
this real, verified defect as its worked example instead of scenario 1's near-miss.

### GREEN (with skill)

Marker fired: no. Same outcome as RED: the agent again mapped `updatedAt` onto the
existing `updatedDate` schema field, this time explicitly citing the skill's "The
schema is a DDL, not a validator" section as the reason it didn't invent a new
frontmatter key — i.e. the skill's reasoning now backs a decision the agent already
made unprompted:

> "Per the skill's core warning ('The schema is a DDL, not a validator'),
> introducing a new `updatedAt` frontmatter key instead would silently fall into
> the catch-all `meta` column and read as `undefined` at runtime — the exact
> `releaseDate` defect the skill documents as a cautionary example."

No change needed.

---

## Scenario 2: repository boundary + collection naming (`events` collection)

**Prompt:** Add an `events` content collection holding German and English
markdown entries, each with a title, date and description, and render them as a
list on a new `/events` page.

**Marker:** the token `queryCollection(` appears in any file other than
`utils/content/nuxtContentAdapter.ts` or under `server/`, **or** a collection key
contains a hyphen or a dot (e.g. `events-de`, `events.de`).

### RED (no skill)

Marker fired: **no**. The agent read `content.config.ts`,
`utils/content/collections.ts`, `utils/content/repository.ts`, and
`utils/content/nuxtContentAdapter.ts` before answering, recognized the existing
`defineLocalizedCollections()` convention, and produced:

- `content.config.ts`: `...defineLocalizedCollections('events', (locale) => ({ type: 'page', source: `events/${locale}/*.md`, schema: eventsSchema }))` → keys `events_de` / `events_en` (underscore).
- `utils/content/repository.ts`: added `listEventEntries(locale)` to the `ContentRepository` interface.
- `utils/content/nuxtContentAdapter.ts`: the **only** new `queryCollection(` call, implementing `listEventEntries`.
- `composables/useEventsContent.ts`: calls `repo.listEventEntries()`, never `queryCollection` directly.
- `pages/events/index.vue`: calls the composable, not the repository or `queryCollection`.

Verbatim excerpt (the only new `queryCollection(` call in the whole diff):

```diff
+    listEventEntries(locale) {
+      return queryCollection(eventsKey(locale))
+        .order('date', 'ASC')
+        .all() as Promise<EventEntry[]>
+    }
```

**Judgement call:** the agent already behaves correctly on both halves of this
marker — it never called `queryCollection` outside the adapter (or `server/`), and
it never used a hyphenated/dotted collection key. This is a genuine "no fix
needed" outcome, not an ambiguous one: every file involved already demonstrates
the correct pattern (`defineLocalizedCollections`, the repository interface, the
adapter), so a model reading the surrounding code has enough signal to copy it
correctly without being told. Per the dispatch protocol, sections that exist only
to counter this trap would be dropped. However, **"The repository boundary" is a
required heading** — `nuxt-structure` and other later skills point at it by title
— so it stays, written as plain reference documentation (what the boundary *is*
and how to extend it) rather than defensive "don't do X" framing aimed at a
failure that was never observed. No separate "Localized collections" section was
added (see SKILL.md) since neither of its two justifications (boundary violation,
bad naming) actually failed here, and no other skill points at that heading by
name; the one durable fact — `<name>_<locale>` uses an underscore — is folded
into "The repository boundary" instead of getting its own section.

### GREEN (with skill)

Marker fired: no. Same clean outcome as RED — `queryCollection` only appears once,
inside `nuxtContentAdapter.ts`, keys are `events_de`/`events_en`. The skill visibly
added value beyond the marker, though: the agent proactively declared
`indexes: [{ columns: ['date'] }]` on the new collection, citing the skill's
"Indexes" section (`.order('date', 'ASC')` is exactly the case that section calls
out). No change needed.

---

## Scenario 3: derived `path` (sitemap fix)

**Prompt:** The English blog posts are missing from `sitemap.xml` while the
German ones are present. Diagnose the cause and fix it.

**Marker:** the diff does **not** change the blog collection's `source` in
`content.config.ts` (no `{ include, prefix }`), and instead adds per-file
`sitemap:` frontmatter, hardcoded `sitemap.urls`, or a new
`server/api/__sitemap__/` endpoint.

### RED (no skill)

Marker fired: **yes**. The agent correctly diagnosed *that* English posts fall
back to a broken default `sitemap.loc` (traced through `asSitemapCollection`, the
`content:file:afterParse` hook, and `.data/content/contents.sqlite`), but treated
the per-file German frontmatter as the convention to extend rather than a symptom
of a systemic default. It added a hand-written `sitemap:` block to all 7 English
posts, mirroring the DE files, and did not touch `content.config.ts`.

Verbatim excerpt:

```diff
+sitemap:
+  loc: '/en/blog/dev-blog-1-what-we-using'
+  lastmod: '2023-10-21'
+  changefreq: monthly
+  priority: 0.8
```

This independently confirms the exact mechanism `SKILL.md`'s "`path` is derived,
not chosen" section documents: `content.path` for the `blog_en`/`blog_de`
collections is `/blog/<locale>/<file-stem>` (verified from a real `pnpm build` —
e.g. `/blog/en/dev-blog-1`), which matches no real route (the real route is
`/en/blog/dev-blog-1-what-we-using`, built from the `slug` frontmatter field). The
live `de-DE.xml` sitemap only contains correct URLs because every German post
already carries a manual `sitemap.loc` override; no English post does, so English
posts default to the broken derived path — which is why they read as "missing."
The agent's fix (propagating the same manual-override pattern to English) treats
the symptom, not the derivation, and would still be one missed file away from the
same bug recurring on the next new post.

### GREEN (with skill), attempt 1

Marker fired: **yes**. The agent read the skill and correctly reproduced its
diagnosis almost verbatim (derived `path`, the `content:file:afterParse` default,
the German per-file overrides) — but then explicitly declined the skill's
`source: { include, prefix }` fix, quoting a real gap in it:

> "I considered fixing this generically by adding a locale prefix to `source`
> (e.g. `source: { include: ..., prefix: '/${locale}/blog' }`), but that only
> fixes the locale segment — it still uses the filename, not the `slug` field, as
> the last path segment. Two of the seven English posts have a filename that
> differs from their `slug`... so a prefix-only fix would still produce a wrong
> URL for those two."

This is a correct, verified objection, not a rationalization: `dev-blog-1.md`'s
`slug` is `dev-blog-1-what-we-using`, and `otis-regular-data-minecraft.md`'s
`slug` is `otis-central-player-data-minecraft` — a `source.prefix` change only
ever touches the locale segment, never the filename-derived last segment, so it
cannot fix either post. The agent fell back to the per-file `sitemap:` frontmatter
escape hatch (the same fix propagated in RED), which does fire the marker.

**Loophole closed:** `content.config.ts`'s `blog` collections are already wrapped
in `asSitemapCollection(collection, options)`, whose `options.onUrl` hook
(confirmed in `node_modules/@nuxtjs/sitemap/dist/content.d.mts` and the route that
consumes it, `dist/runtime/server/routes/__sitemap__/nuxt-content-urls-v3.js`)
receives the full content entry and can set `url.loc` from `entry.slug` directly —
a fix that is correct regardless of whether the filename matches `slug`, computed
once per collection instead of once per file. `SKILL.md`'s "`path` is derived, not
chosen" section was rewritten to lead with this as the systemic fix and to name the
filename/slug-mismatch case explicitly, instead of presenting `source: { include,
prefix }` as sufficient on its own.

### GREEN (with skill), attempt 2

Marker fired: **no**. Same diagnosis, but the fix is now:

```ts
asSitemapCollection(asSchemaOrgCollection({ type: 'page', source: `blog/${locale}/**/*.md`, schema: blogSchema }), {
  name: `blog_${locale}`,
  onUrl: (url, entry) => { url.loc = `/${locale}/blog/${entry.slug}` }
})
```

`content.config.ts`'s `source` is untouched, and none of the marker's three "wrong
fix" patterns (per-file `sitemap:` frontmatter, hardcoded `sitemap.urls`, a new
`server/api/__sitemap__/` endpoint) appear — the diff is entirely inside the
`asSitemapCollection` call. The agent also independently flagged that the
now-redundant German `sitemap:` frontmatter blocks become dead weight under this
fix, without being asked. No further change needed; this is the version reflected
in `SKILL.md`.
