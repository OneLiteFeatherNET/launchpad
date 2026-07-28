# Launchpad Knowledge Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four checked-in Claude skills under `.claude/skills/` that carry the framework knowledge agents get wrong when working on this repo — `@nuxt/content` v3, Tailwind v4, the `@nuxtjs/seo` + i18n stack, and the Nuxt 4 project layout.

**Architecture:** Each skill is a hub `SKILL.md` (under 150 lines) plus `references/*.md` loaded on demand. Skills are written test-first: three falsifiable baseline scenarios run against a fresh subagent *without* the skill, the observed failures determine the content, then the same scenarios re-run *with* the skill must stop firing their markers. Content with no corresponding baseline failure gets deleted.

**Tech Stack:** Markdown only — no code ships. Verification uses `git grep`, `pnpm build`, `pnpm lint`, `pnpm seo:check`, and subagent dispatch.

**Spec:** `docs/superpowers/specs/2026-07-27-launchpad-knowledge-skills-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **SKILL.md under 150 lines**, including frontmatter. Verify with `wc -l`.
- **Frontmatter has exactly two fields**: `name` and `description`. `name` is lowercase letters, numbers and hyphens only, and must match the directory name. `description` is third person, states what the skill covers **and** its triggering conditions, and stays under 1024 characters.
- **References are one level deep.** `SKILL.md` links to `references/*.md`. A `references/*.md` file must never link to another `references/*.md` file — cross-topic pointers name the *other skill* instead.
- **Reference files over 100 lines open with a `## Contents` table of contents.**
- **Superseded APIs go in a collapsed block**: `<details><summary>Old patterns (…)</summary>`. Never in running prose, never with dates like "before August 2025".
- **One default with an escape hatch**, never a menu of options.
- **Forward slashes** in every path.
- **Every SKILL.md ends with a `## Verify` section** that is a loop: run a command, read its output, fix, repeat.
- **Repo pointers are integrated** into the section that needs them, not appended as a separate block.
- **Version anchor**, stated once near the top of each SKILL.md: `Nuxt 4.2 · @nuxtjs/seo 5.1 · @nuxtjs/i18n 10.3 · @nuxt/content 3.14 · Tailwind 4.1 · Cloudflare Workers + D1`.
- **No content that a competent current model produces unprompted.** If a baseline scenario did not surface it, it does not go in.
- **Skills are written in English**, matching `AGENTS.md` and the rest of the repo.
- **Do not fix the production defects** listed in spec §11. They are out of scope for this plan and tracked separately.

## Baseline dispatch protocol

Used identically by every task. Read this once.

Each baseline run dispatches **one fresh subagent per scenario** with:

- `subagent_type: "general-purpose"`, `run_in_background: false`
- The scenario prompt **verbatim** as written in the task
- This suffix appended to every baseline prompt:

  > Work in `/mnt/projects/oss/onelitefeather/launchpad`. Read whatever files you need, but **do not write, edit or create any file**. Return your answer as a unified diff in a fenced code block, plus a one-paragraph explanation of your approach. If you would create a new file, show its full intended contents in the diff.

The read-only constraint matters: the baseline measures what an agent *would* do, and a writing agent would corrupt the repo between runs.

**The skill must not exist yet when its baseline runs.** That is what makes the run a true baseline — do not create the skill directory before step 1 of its task.

For the GREEN re-run, the same scenario prompt is used with this prefix added:

> First read `/mnt/projects/oss/onelitefeather/launchpad/.claude/skills/<skill-name>/SKILL.md` and follow it. Load a file from its `references/` directory only if the SKILL.md points you there for this task.

Record every run in `docs/superpowers/baselines/<skill-name>.md` using this structure:

```markdown
# Baseline: <skill-name>

## Scenario 1: <one-line title>

**Prompt:** <verbatim>
**Marker:** <the falsifiable check>

### RED (no skill)
Marker fired: yes/no
Verbatim excerpt of the offending output:
<excerpt>

### GREEN (with skill)
Marker fired: yes/no
<excerpt or "correct output">
```

**If a marker does not fire during RED**, the agent already behaves correctly. Record that, and delete the corresponding SKILL.md section from the plan for that task. This is a valid outcome, not a failure.

---

### Task 1: `nuxt-content-cms`

First skill deliberately: the v2→v3 break gives the sharpest falsifiable markers, which validates the whole test-first approach before the harder skills.

**Files:**
- Create: `.claude/skills/nuxt-content-cms/SKILL.md`
- Create: `.claude/skills/nuxt-content-cms/references/body-and-prose.md`
- Create: `.claude/skills/nuxt-content-cms/references/cloudflare-d1.md`
- Create: `.claude/skills/nuxt-content-cms/references/v2-to-v3-migration.md`
- Create: `docs/superpowers/baselines/nuxt-content-cms.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the skill name `nuxt-content-cms`, referenced by Task 2 (`prose-and-code-blocks.md` points at it for override resolution), Task 3 (module ordering, sitemap split) and Task 4 (repository boundary pointer). Section titles other skills point to: `The repository boundary`, `path is derived, not chosen`.

- [ ] **Step 1: Run baseline scenario 1 (schema is a DDL)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Blog posts on this site should show a "Last updated" line when they have been revised. Add an `updatedAt` date to the two most recent English blog posts and render "Last updated <date>" on the article page when the field is present.

**Marker:** the returned diff modifies files under `content/` and a `.vue` file, but does **not** modify `content.config.ts`.

- [ ] **Step 2: Run baseline scenario 2 (repository boundary + collection naming)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Add an `events` content collection holding German and English markdown entries, each with a title, date and description, and render them as a list on a new `/events` page.

**Marker:** the token `queryCollection(` appears in any file other than `utils/content/nuxtContentAdapter.ts` or under `server/`, **or** a collection key contains a hyphen or a dot (e.g. `events-de`, `events.de`).

- [ ] **Step 3: Run baseline scenario 3 (derived path)**

Dispatch a subagent with this prompt plus the read-only suffix:

> The English blog posts are missing from `sitemap.xml` while the German ones are present. Diagnose the cause and fix it.

**Marker:** the diff does **not** change the blog collection's `source` in `content.config.ts` (no `{ include, prefix }`), and instead adds per-file `sitemap:` frontmatter, hardcoded `sitemap.urls`, or a new `server/api/__sitemap__/` endpoint.

- [ ] **Step 4: Record the baseline**

Create `docs/superpowers/baselines/nuxt-content-cms.md` using the structure from the dispatch protocol. Quote the offending output verbatim — the exact wrong symbol is what the skill has to counter.

For any scenario whose marker did **not** fire, note it and drop the matching section in Step 5.

- [ ] **Step 5: Write `SKILL.md`**

Create `.claude/skills/nuxt-content-cms/SKILL.md` with frontmatter:

```yaml
---
name: nuxt-content-cms
description: >-
  Covers the @nuxt/content v3 content layer in this repository — per-locale
  collections in content.config.ts, zod schemas as SQL column definitions, the
  ContentRepository and nuxtContentAdapter boundary, how a page collection's path
  is derived and what that means for the sitemap, the differing app and Nitro
  queryCollection signatures, Prose component overrides, and the minimark body
  format. Use when adding or editing a collection, a frontmatter field, a markdown
  or YAML content file, a content query, or a Prose override, and when content
  pages are missing from sitemap.xml, a frontmatter value reads as undefined, a
  query returns null or empty, or a "no such column" error appears.
---
```

Sections and line budgets per spec §7.3: `The repository boundary` (22), `The schema is a DDL, not a validator` (22), `Localized collections` (18), `path is derived, not chosen` (24), `Two call signatures` (12), `Module order` (7), `Indexes` (10), `Verify` (10), references index (8).

Two content requirements that are easy to miss:

- The `The schema is a DDL` section must use the live `releaseDate` case as its worked example: the field is used in `composables/useBlogContent.ts:12` and typed in `types/blog.ts:46` but absent from `blogSchema` in `content.config.ts`, so it lands in the `meta` column and reads `undefined`. Present it as an illustration of the rule. **Do not fix it** — that is spec §11, out of scope.
- The `Verify` section is this loop: run `pnpm build`, read `dist/__nuxt_content/<collection>/sql_dump.txt`, confirm the expected columns, `path` values and `CREATE INDEX` statements appear, fix `content.config.ts`, rebuild.

- [ ] **Step 6: Write the three reference files**

`references/v2-to-v3-migration.md` (~60 lines) — everything inside one collapsed block:

```markdown
# @nuxt/content v2 → v3

<details>
<summary>Old patterns (@nuxt/content v2)</summary>

| v2 | v3 |
|---|---|
| `queryContent()` | `queryCollection()` |
| `.findOne()` / `.find()` | `.first()` / `.all()` |
| `fetchContentNavigation()` | `queryCollectionNavigation()` |
| `.findSurround()` | `queryCollectionItemSurroundings()` |
| `doc._path` | `doc.path` |
| `useContent()` | removed |
| `<ContentDoc>` / `<ContentList>` / `<ContentQuery>` | `<ContentRenderer>` |
| `<ContentSlot>` / `<MDCSlot>` | `<slot mdc-unwrap="p">` |
| `_dir.yml` | `.navigation.yml` |
| `ProseCodeInline` | `ProseCode` |
| `ProseCode` | `ProsePre` |

</details>
```

`references/cloudflare-d1.md` (~55 lines) — the deployment contract: `nitro.preset: 'cloudflare_module'`, `compatibilityDate >= 2024-09-19`, `externals.inline: ['@nuxt/content']`, the `DB` binding and `content.database.bindingName`; that `content.database = { type: 'sqlite' }` is force-overridden with only a `logger.warn`; that a missing binding fails on the first query rather than at build time; that each cold start restores the dump, so prerender what you can.

`references/body-and-prose.md` (~80 lines) — the stored body is minimark (`{ type: 'minimark', value: [[tag, attrs, ...children]] }`), not HTML and not the v2 tree; use `extractPlainText` from `utils/content.ts`; `<ContentRenderer :excerpt>`; `rawbody: z.string()` is the only route to the original markdown. Then the Prose override contract: copy the original from `@nuxtjs/mdc`, keep exact prop parity, use an identical filename in `components/content/`, register without `global: true`. End with one pointer line to the `tailwind-design` skill for what classes go inside an override — **not** a link to that skill's reference file.

Neither file exceeds 100 lines, so no table of contents is required. If one does during writing, add a `## Contents` list.

- [ ] **Step 7: Check the mechanical constraints**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
wc -l .claude/skills/nuxt-content-cms/SKILL.md
grep -c "" .claude/skills/nuxt-content-cms/references/*.md
grep -n "references/" .claude/skills/nuxt-content-cms/references/*.md
```

Expected: SKILL.md under 150 lines; no output from the third command (no reference-to-reference links). If the third command prints anything, rewrite that link to name the other skill instead.

- [ ] **Step 8: Re-run all three scenarios with the skill (GREEN)**

Dispatch three fresh subagents using the same prompts from Steps 1-3, with the skill-reading prefix from the dispatch protocol.

Expected: no marker fires. Specifically — scenario 1's diff now touches `content.config.ts`; scenario 2 routes through `repository.ts` and `nuxtContentAdapter.ts` with an `events_de` / `events_en` naming; scenario 3 changes the collection's `source`.

- [ ] **Step 9: Close loopholes (REFACTOR)**

For every marker that still fires, quote the agent's new reasoning in the baseline file, add an explicit counter to the relevant SKILL.md section, and re-run only that scenario. Repeat until all three are clean.

If a section of SKILL.md corresponds to no fired marker across all runs, delete it.

- [ ] **Step 10: Commit**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
git add .claude/skills/nuxt-content-cms docs/superpowers/baselines/nuxt-content-cms.md
git commit -m "feat(skills): add nuxt-content-cms knowledge skill

Written test-first: three baseline scenarios run against a fresh agent
without the skill, content derived from the observed failures, then
re-run with the skill until no marker fired. Baseline recorded."
```

---

### Task 2: `tailwind-design`

**Files:**
- Create: `.claude/skills/tailwind-design/SKILL.md`
- Create: `.claude/skills/tailwind-design/references/theme-authoring.md`
- Create: `.claude/skills/tailwind-design/references/v4-utility-changes.md`
- Create: `.claude/skills/tailwind-design/references/prose-and-code-blocks.md`
- Create: `docs/superpowers/baselines/tailwind-design.md`

**Interfaces:**
- Consumes: the skill name `nuxt-content-cms` from Task 1, cited by name in `prose-and-code-blocks.md`.
- Produces: the skill name `tailwind-design`, cited by Task 3 (OG image scope exclusion) and Task 4 (CSS entry points).

- [ ] **Step 1: Establish the ground truth for the markers**

Before dispatching, record the facts the markers depend on:

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
grep -n -- "--color-" assets/css/tailwind.css
grep -rEo "\b(bg|text|ring|border)-(primary|secondary|accent)\b" --include="*.vue" components/ pages/ layouts/ | sed 's/.*://' | sort | uniq -c
grep -rn "var(--color-secondary)" --include="*.vue" --include="*.css" . | grep -v node_modules | wc -l
grep -rn "@config" assets/css/ nuxt.config.ts || echo "no @config — tailwind.config.mts is inert"
```

Paste the output into the baseline file's header. The skill's token table is built from the first command's output — the real token names, not remembered ones.

- [ ] **Step 2: Run baseline scenario 1 (token contract)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Add a "Beta" badge chip component in the brand primary color, following the existing chip styling in this project. It should sit next to the page title on the blog index.

**Marker:** any emitted class matching `(bg|text|ring|border|from|to)-(primary|secondary|accent)\b` or `brand-\d{2,3}`.

Save the agent's returned diff to the scratchpad, then check it:

```bash
grep -Eo "(bg|text|ring|border|from|to)-(primary|secondary|accent)\b|brand-[0-9]{2,3}" \
  /tmp/claude-1000/-mnt-projects-oss-onelitefeather-launchpad/*/scratchpad/baseline-tailwind-1.diff
```

Expected correct answer: `bg-brand-primary`, `text-brand-accent`, `bg-secondary-cyan`.

- [ ] **Step 3: Run baseline scenario 2 (dark mode has two mechanisms)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Add a light/dark theme toggle button to the site navigation, so visitors can override their operating system preference.

**Marker:** the diff edits `tailwind.config.mts`, **and/or** `assets/css/tailwind.css` gains no `@custom-variant dark` line, **and/or** the `light-dark()` tokens in `@theme` are left untouched. Any one of these means the toggle would flip `dark:` utilities while every `bg-surface` / `text-text` / `border-border` keeps following the OS.

- [ ] **Step 4: Run baseline scenario 3 (unresolvable arbitrary values)**

Dispatch a subagent with this prompt plus the read-only suffix:

> The keyboard focus ring on the main navigation items is invisible. Fix it.

**Marker:** the patch retains a `var(--color-secondary)` reference without adding that token to `@theme` and without switching to a defined token such as `ring-brand-secondary`.

- [ ] **Step 5: Record the baseline**

Create `docs/superpowers/baselines/tailwind-design.md` per the dispatch protocol, with the Step 1 ground-truth output in the header.

- [ ] **Step 6: Write `SKILL.md`**

```yaml
---
name: tailwind-design
description: >-
  Covers styling this Nuxt site with Tailwind CSS v4 — the @theme token contract
  in assets/css/tailwind.css, which brand utility names actually compile, the
  light-dark() and dark: variant split, where custom CSS and component classes
  belong, the focus-ring convention, and how to verify a class survived the build.
  Use when adding or changing utility classes on a component, page or layout,
  adding a color, gradient, spacing or animation token, building a dark-mode
  toggle, styling markdown or Prose output and code blocks, editing tailwind.css,
  tokens.css or tailwind.config.mts, or when a utility class or focus ring appears
  to have no effect.
---
```

Sections per spec §7.4: `The token contract` (22), `Arbitrary var() classes must resolve` (14), `Dark mode: two mechanisms, one OS signal` (18), `Where custom CSS goes` (18), `Focus rings` (14), `Verify` (16).

Content requirements:

- The token table is built from Step 1's actual output. Two columns: **use** (`bg-brand-primary`, `text-brand-accent`, `bg-secondary-cyan`, `bg-bg`, `bg-surface`, `text-text`, `text-muted`, `border-border`) and **never** (`*-primary`, `*-secondary`, `*-accent`, `*-brand-<number>`). State that existing usages in the repo are wrong and will reinforce the wrong answer if copied — with the count from Step 1.
- `tailwind.config.mts` is inert: no `@config` references it. Never edit it to add a color.
- The dark-mode section states that a class toggle needs **both** `@custom-variant dark (&:where(.dark, .dark *));` after the `@import` **and** every `light-dark()` token replaced. Half the migration is the failure mode.
- The `Verify` loop: `pnpm build`, then grep the built stylesheet for the escaped full class name — `grep -o '\.ring-brand-500' dist/_nuxt/*.css` — because ESLint does not check class names and the build succeeds with dead classes in place. Nothing found means the class does not exist; fix the token or the class name and rebuild.

- [ ] **Step 7: Write the three reference files**

`references/theme-authoring.md` (~55 lines) — `@theme` at top level only, never nested in `.dark {}`; `@theme inline` when a token's value is itself a `var()`; `@theme static` for tokens consumed only through arbitrary values or JS; `--animate-*` keyframes inside the block; a token should exist only if it mints a utility.

`references/v4-utility-changes.md` (~70 lines) — the component-class policy (`@utility` over `@layer components`, and why the zero-`@apply` state is deliberate: `@apply` outside the main stylesheet needs `@reference`, which re-parses the theme per file). Then one collapsed block:

```markdown
<details>
<summary>Old patterns (Tailwind v3)</summary>

| v3 | v4 |
|---|---|
| `flex-shrink-*` / `flex-grow-*` | `shrink-*` / `grow-*` |
| `!text-center` | `text-center!` |
| `bg-[--brand]` | `bg-(--brand)` |
| `bg-opacity-50` | `bg-black/50` |
| `outline outline-2` | `outline-2` |
| `tailwind.config.js` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |

</details>
```

`references/prose-and-code-blocks.md` (~55 lines) — the styling map for `@nuxt/content` output: the `components/content/Prose*.vue` overrides, the missing `ProseCode` override, and the Shiki dual-theme contract (the config emits per-theme custom properties, nothing consumes them, so code blocks stay light-themed until a `--shiki-dark` rule is written by hand). One pointer line to the `nuxt-content-cms` **skill** for how an override resolves — name the skill, do not link its reference file.

- [ ] **Step 8: Check the mechanical constraints**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
wc -l .claude/skills/tailwind-design/SKILL.md
grep -n "references/" .claude/skills/tailwind-design/references/*.md
```

Expected: under 150 lines; no output from the second command.

- [ ] **Step 9: Re-run all three scenarios with the skill (GREEN)**

Same prompts, with the skill-reading prefix. Expected: chip uses `bg-brand-primary`; the toggle adds `@custom-variant dark` **and** addresses the `light-dark()` tokens **and** leaves `tailwind.config.mts` alone; the focus-ring fix replaces the undefined token rather than tuning the ring width.

- [ ] **Step 10: Close loopholes (REFACTOR)**

As Task 1 Step 9. Delete any section no marker exercised.

- [ ] **Step 11: Commit**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
git add .claude/skills/tailwind-design docs/superpowers/baselines/tailwind-design.md
git commit -m "feat(skills): add tailwind-design knowledge skill

Covers the v4 @theme token contract, the two dark-mode mechanisms and
arbitrary-value resolution. Written test-first against three baseline
scenarios; baseline recorded."
```

---

### Task 3: `nuxt-seo`

Largest skill — four reference files. Do it third, once the pattern is proven.

**Files:**
- Create: `.claude/skills/nuxt-seo/SKILL.md`
- Create: `.claude/skills/nuxt-seo/references/og-images.md`
- Create: `.claude/skills/nuxt-seo/references/i18n-sitemap-robots.md`
- Create: `.claude/skills/nuxt-seo/references/seo-utils-defaults.md`
- Create: `.claude/skills/nuxt-seo/references/schema-org-and-site-identity.md`
- Create: `docs/superpowers/baselines/nuxt-seo.md`

**Interfaces:**
- Consumes: the skill names `nuxt-content-cms` (Task 1) and `tailwind-design` (Task 2), both cited by name.
- Produces: the skill name `nuxt-seo` and the canonical ordered `modules` array, which Task 1's `Module order` section and Task 4's head-ownership line both point to.

- [ ] **Step 1: Establish ground truth for the markers**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
sed -n '30,45p' node_modules/@nuxtjs/i18n/dist/runtime/kit/head.js
grep -n "concat(value)" node_modules/.pnpm/@nuxt+kit@*/node_modules/@nuxt/kit/dist/index.mjs
grep -rn "prerender" nuxt.config.ts || echo "no nitro.prerender"
grep -n "useLocaleHead\|rel: 'canonical'\|rel: 'alternate'" layouts/default.vue composables/*.ts
```

Paste into the baseline file header. These four outputs are the evidence behind three of the skill's sections.

- [ ] **Step 2: Run baseline scenario 1 (locale objects need `language`)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Add French as a third locale to this site, alongside German and English.

**Marker:** the diff contains the key `iso:` and no `language:`, **and/or** `$production.i18n.locales` is restated with the full locale array.

- [ ] **Step 3: Run baseline scenario 2 (canonical/hreflang ownership)**

Dispatch a subagent with this prompt plus the read-only suffix:

> We are adding a `/partners` page. It needs a proper canonical URL and hreflang tags for both locales.

**Marker:** the string `rel: 'canonical'` or `rel: 'alternate'` appears in any file other than `layouts/default.vue`.

- [ ] **Step 4: Run baseline scenario 3 (zeroRuntime preconditions)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Open Graph images come out blank for blog articles in production, though they work in development. Diagnose and fix it.

**Marker:** the patch contains no `nitro.prerender` block **and** adds no new file under `components/OgImage/*.satori.vue`. Typical failures: editing the template, renaming the template string, or disabling `zeroRuntime`.

- [ ] **Step 5: Record the baseline**

Per the dispatch protocol, with Step 1's output in the header.

- [ ] **Step 6: Write `SKILL.md`**

```yaml
---
name: nuxt-seo
description: >-
  Covers SEO for this Nuxt 4 site — canonical and hreflang ownership via
  useLocaleHead, @nuxtjs/i18n locale objects, @nuxtjs/seo module version floors,
  site URL resolution, Schema.org identity and @ids, robots directives, sitemap
  sources, and OG image generation with nuxt-og-image. Use when editing the i18n,
  site, sitemap, robots, schemaOrg or ogImage blocks in nuxt.config.ts, when
  touching usePageSeo, useArticleSeo, useLocaleHead, useHead, useSeoMeta,
  defineOgImage or JSON-LD, when adding a locale or a page that needs metadata, or
  when hreflang, canonical tags, og:image, robots.txt or sitemap.xml entries are
  missing, duplicated or wrong.
---
```

Sections per spec §7.1: `Emitter ownership map` (14), `Locale objects need language, never iso` (16), `Env blocks concatenate arrays` (14), `@nuxtjs/seo is an alias — check the lockfile` (18), `One site URL: NUXT_SITE_URL` (12), `Robots via routeRules, once` (10), `zeroRuntime has three preconditions` (16), `Verify` (8), references index (8).

Content requirements:

- `Emitter ownership map` doubles as the repo pointer table. Hard rule stated once: no `rel=canonical` and no `rel=alternate` outside `layouts/default.vue`.
- The `language` section must show the full silent-failure chain and note that TypeScript never flags `iso:` because `LocaleObject` carries an index signature. Include a correct/wrong code pair.
- The env-block section names the four concrete footguns: `i18n.locales`, `schemaOrg.identity.sameAs`, `contactPoint`, `image.format`.
- The alias section carries the floor table (robots ≥6, sitemap ≥8, schema-org ≥6, og-image ≥6.2, seo-utils ≥8.1, site-config ≥4, link-checker ≥5) and the diagnostic: read the lockfile's root importer, not `package.json`. The tell — `asSitemapCollection` compiling means the v4 generation resolved; `defineSitemapSchema` means v5.
- `Verify` loop: `pnpm seo:check`, read the assertion failures, fix, re-run; then view-source and count `rel=canonical` and `rel=alternate` occurrences; CI gates live in `.github/workflows/seo.yml` and `.lighthouserc.json` (SEO ≥ 0.95).

The repo currently violates three of these sections (spec §11). Write them as rules, using the repo state as the illustrating example. **Do not fix the config.**

- [ ] **Step 7: Write the four reference files**

`references/og-images.md` (~75 lines) — the island boundary (an OG template renders in a Satori island with no locale prefix, no cookies and no messages, so i18n must be resolved in the page and passed as props), the og-image v6 renames, fonts, and the concrete `nitro.prerender` recipe that makes `zeroRuntime` viable here. This file is the single place the prerender route list is written.

`references/i18n-sitemap-robots.md` (~85 lines) — sitemap and robots mechanics under `strategy: 'prefix'`: `includeAppSources`, `_i18nTransform`, `_sitemap: 'de'`, the XSL stylesheet hiding `xhtml:link` alternates and the `xslColumns` diagnostic, robots `autoI18n` path expansion, `_skipI18n`, and registering data-collection sources through `sitemap.sources`.

`references/seo-utils-defaults.md` (~55 lines) — the four defaults active with no config: `canonicalLowercase` (and how it invalidates hreflang targets), `canonicalQueryWhitelist`, `redirectToCanonicalSiteUrl`, `fallbackTitle`.

`references/schema-org-and-site-identity.md` (~70 lines) — localised identity through the `nuxtSiteConfig.name` / `nuxtSiteConfig.description` message keys; identity in `nuxt.config.schemaOrg` **or** `useSchemaOrg(defineOrganization())` but never both, because they merge rather than replace; `schemaOrg.reactive`; the stable `@id` builders in `utils/schema-ids.ts`.

`i18n-sitemap-robots.md` is budgeted at 85 lines. If it lands over 100, add a `## Contents` table of contents.

- [ ] **Step 8: Check the mechanical constraints**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
wc -l .claude/skills/nuxt-seo/SKILL.md .claude/skills/nuxt-seo/references/*.md
grep -n "references/" .claude/skills/nuxt-seo/references/*.md
```

Expected: SKILL.md under 150; no reference-to-reference links. Any reference file over 100 lines must start with `## Contents` — verify by reading its first 10 lines.

- [ ] **Step 9: Re-run all three scenarios with the skill (GREEN)**

Expected: the French locale uses `language: 'fr-FR'` and is added only to the base config; the `/partners` page adds no canonical or alternate link tags of its own; the OG fix adds prerendering and a local template copy.

- [ ] **Step 10: Close loopholes (REFACTOR)**

As Task 1 Step 9.

- [ ] **Step 11: Commit**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
git add .claude/skills/nuxt-seo docs/superpowers/baselines/nuxt-seo.md
git commit -m "feat(skills): add nuxt-seo knowledge skill

Covers canonical/hreflang ownership, i18n locale objects, env-block array
merging, module version floors and zeroRuntime preconditions. Written
test-first against three baseline scenarios; baseline recorded."
```

---

### Task 4: `nuxt-structure` — build or kill

This task has a gate. The spec flags this skill as marginal: four of its six proposed sections are pointers to Tasks 1-3. Running it last means the gate can be judged against three finished skills.

**Files:**
- Create: `.claude/skills/nuxt-structure/SKILL.md` *(only if the gate passes)*
- Create: `.claude/skills/nuxt-structure/references/nuxt4-runtime-deltas.md` *(only if the gate passes)*
- Create: `.claude/skills/nuxt-structure/references/server-and-shared.md` *(only if the gate passes)*
- Create: `docs/superpowers/baselines/nuxt-structure.md` *(always)*
- Modify: `AGENTS.md` *(only if the gate fails)*

**Interfaces:**
- Consumes: the skill names `nuxt-seo`, `nuxt-content-cms` and `tailwind-design`, each cited by name in a single pointer line.
- Produces: either the skill `nuxt-structure`, or two bullets in `AGENTS.md`.

- [ ] **Step 1: Run baseline scenario 1 (the `app/` trap)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Add a global route middleware that redirects `/blog/feed` to `/blog`.

**Marker:** any file created under `app/`. This is the highest-value marker in the whole plan — a single file there flips `srcDir` and unmounts every route with no error.

- [ ] **Step 2: Run baseline scenario 2 (the Nitro import boundary)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Article release state is computed in two places and should be shared: `composables/useBlogContent.ts` needs it, and so does `server/api/__sitemap__/team.ts`. Extract it into one helper used by both.

**Marker:** a file under `server/` with a runtime value import from `~/utils`, `~/composables` or `~/types` (an `import type` is fine), **or** the helper placed anywhere other than `shared/utils`.

- [ ] **Step 3: Run baseline scenario 3 (the house `useAsyncData` shape)**

Dispatch a subagent with this prompt plus the read-only suffix:

> Add a `useTimelineContent()` composable that loads the timeline entries for the currently active locale, following the conventions of the other content composables in this project.

**Marker:** the `useAsyncData` key argument is a string literal rather than a getter, **and/or** the options object omits `watch: [locale]`.

Note this scenario says "following the conventions of the other content composables" — an agent that reads `useTeamRoster.ts` first may well get it right. If the marker does not fire, that is a genuine finding and the section goes.

- [ ] **Step 4: Record the baseline and apply the gate**

Write `docs/superpowers/baselines/nuxt-structure.md` per the protocol.

Then apply the gate. Draft the SKILL.md sections that correspond to **fired** markers only, and count the lines that a competent Nuxt agent would have produced unprompted — file-based routing, `components/` auto-prefixing, `useState` versus module refs, `runtimeConfig` basics, the existence of `<ClientOnly>`.

**Gate: if that count exceeds 15 lines, kill the skill.** Go to Step 8.

Record the decision and its reasoning in the baseline file either way.

- [ ] **Step 5: Write `SKILL.md`** *(gate passed)*

```yaml
---
name: nuxt-structure
description: >-
  Explains where code lives in this Nuxt 4 repository and how its data layer
  behaves — the root-level srcDir with no app/ directory, auto-import scan rules
  for composables and utils, the layout/page/app.vue ownership split, the Nitro
  server directories, and the useAsyncData conventions every composable follows.
  Use when adding or moving a page, component, composable, util, layout, plugin,
  middleware or server route, when scaffolding a new feature or section, when
  writing useAsyncData, useState, definePageMeta or runtimeConfig code, when a
  ~/... import or an auto-import fails to resolve, or when considering a migration
  to the Nuxt 4 app/ directory layout.
---
```

Sections per spec §7.2, restricted to those whose markers fired: `Layout map + the app/ rule` (22), `Where new code goes` (16), `The house useAsyncData shape` (24), `Nuxt 4 data semantics` (16), `Ownership: layout, app.vue, page` (14), `Server boundary` (16), `SSR determinism` (12), `Verify` (7).

The four pointer lines — head tags to `nuxt-seo`, content access to `nuxt-content-cms`, CSS entry points to `tailwind-design`, and no deployment content at all — stay at one line each. If any grows past a line, the content belongs in the other skill.

`Verify` loop: run `pnpm nuxt prepare` after adding composables, utils or server routes, then re-check the failing import. The symptom of a stale `.nuxt` is every `~/...` resolving to `<root>/app/...`.

- [ ] **Step 6: Write the two reference files** *(gate passed)*

`references/nuxt4-runtime-deltas.md` (~105 lines, **needs `## Contents`**) — only the six deltas a realistic edit here can trip: `getCachedData(key, nuxtApp, ctx)` running on every fetch (branch on `ctx.cause`), `dedupe: 'cancel' | 'defer'`, `pending` derived from `status`, `route.name` rather than `route.meta.name`, `generate.routes` replaced by `nitro.prerender`, and Unhead v2 dropping `hid` / `vmid` / `children` / `body`. Plus the `definePageMeta` macro constraints.

Explicitly excluded, per spec §9: `builder:watch` absolute paths, `callHook` returning void, `pages:extend` → `pages:resolved` ordering, `window.__NUXT__` → `payload`, every module-authoring delta, and every `npx codemod nuxt/4/*` invocation — the file-structure codemod creates `app/` and would cause the exact failure this skill prevents.

`references/server-and-shared.md` (~70 lines) — `serverDir` is rootDir-relative and must stay outside any future `app/`; file-route-beats-module-handler precedence, with `server/routes/__sitemap__/[sitemap].xml.ts` as the worked example; `shared/` auto-import restrictions (only `shared/utils` and `shared/types`, no `vue` or `h3` imports) and the `#shared` alias; nested directories needing both `imports.dirs` and `nitro.imports.dirs`.

- [ ] **Step 7: Verify, re-run, refactor, commit** *(gate passed)*

Mechanical checks:

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
wc -l .claude/skills/nuxt-structure/SKILL.md .claude/skills/nuxt-structure/references/*.md
grep -n "references/" .claude/skills/nuxt-structure/references/*.md
head -12 .claude/skills/nuxt-structure/references/nuxt4-runtime-deltas.md
```

Expected: SKILL.md under 150; no reference-to-reference links; `nuxt4-runtime-deltas.md` opens with `## Contents`.

Re-run the fired scenarios with the skill-reading prefix, close loopholes as in Task 1 Step 9, then:

```bash
git add .claude/skills/nuxt-structure docs/superpowers/baselines/nuxt-structure.md
git commit -m "feat(skills): add nuxt-structure knowledge skill

Covers the app/ srcDir trap, the house useAsyncData shape, Nuxt 4 data
semantics and the Nitro import boundary. Written test-first; baseline
recorded."
```

Then skip Step 8 — go to Task 5.

- [ ] **Step 8: Kill path — fold into `AGENTS.md`** *(gate failed)*

Do not create `.claude/skills/nuxt-structure/`. Add two bullets to `AGENTS.md` under `## Agent-Specific Instructions`:

```markdown
- **Never create a file under `app/`.** `srcDir` is auto-detected; this repo
  keeps its sources at the root. One non-exempt file under `app/` flips
  `srcDir` and silently unmounts every route and auto-import. Only
  `spa-loading-template.html` and `router.options.*` are exempt. Do not run
  `npx codemod nuxt/4/file-structure`.
- **Nitro cannot import app code.** `server/**` reaches neither `~/utils`,
  `~/composables` nor `~/types` at runtime. Code needed on both sides goes in
  `shared/utils` or `shared/types` — those two directories only, with no `vue`
  or `h3` imports.
```

Commit:

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
git add AGENTS.md docs/superpowers/baselines/nuxt-structure.md
git commit -m "docs: fold Nuxt structure rules into AGENTS.md

Baseline testing showed a nuxt-structure skill would mostly restate what
the model already produces. The two facts that earned their place — the
app/ srcDir trap and the Nitro import boundary — become AGENTS.md rules
instead. Baseline recorded."
```

---

### Task 5: Rewrite the `AGENTS.md` skills section

`AGENTS.md:45-92` still advertises roughly 40 skills deleted in `21ebaef` and `883d57c`. Every agent session currently reads a list of skills that do not exist.

**Files:**
- Modify: `AGENTS.md:45-92`

**Interfaces:**
- Consumes: the final skill roster from Tasks 1-4 — three or four skills depending on Task 4's gate.

- [ ] **Step 1: Confirm the actual roster**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
ls -1 .claude/skills/
```

Write the section against this output, not against the plan's expectation.

- [ ] **Step 2: Replace the section**

Delete `AGENTS.md` lines 45-92 (`## Reusable Agents & Skills (\`.claude/\`)` through the end of that section) and write:

```markdown
## Knowledge Skills (`.claude/skills/`)

These ship with the repo so every CLI, web and CI session gets the same
standards. Each skill is a short `SKILL.md` plus `references/` files loaded
only when needed. They carry the framework behaviour that is easy to get
wrong here — not general Nuxt or Tailwind documentation.

- **`nuxt-seo`** — canonical and hreflang ownership, i18n locale objects,
  module version floors, site URL resolution, Schema.org, robots, sitemap
  sources, OG images. Read it before touching `nuxt.config.ts`'s `i18n`,
  `site`, `sitemap`, `robots`, `schemaOrg` or `ogImage` blocks, or any SEO
  composable.
- **`nuxt-content-cms`** — collections, zod schemas as SQL column
  definitions, the `ContentRepository` boundary, derived `path` values,
  Prose overrides. Read it before editing `content.config.ts`, a content
  file, or a content query.
- **`tailwind-design`** — the `@theme` token contract, which utility names
  compile, the two dark-mode mechanisms, where custom CSS belongs. Read it
  before adding utility classes or design tokens.

Preserved from the previous skill set: source maps are never published to
production, and the Lighthouse `valid-source-maps` audit is an accepted
trade-off. Accessibility is enforced in CI through
`eslint-plugin-vuejs-accessibility` (`pnpm lint`) and the Lighthouse
accessibility gate (error, minScore 0.9). The `best-practices` gate is
`warn` (minScore 0.9) and the suite runs the desktop preset only — mobile
performance is the known weak spot; check it manually.

When adding a skill, place it under `.claude/skills/` and list it here.
```

Add the `nuxt-structure` bullet if Task 4's gate passed. If it failed, the two `app/` and Nitro bullets from Task 4 Step 8 are already in `## Agent-Specific Instructions` — leave them there and do not duplicate them here.

- [ ] **Step 3: Verify no stale references remain**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
grep -nE "a11y-|perf-|sec-|net-|bp-|privacy-|component-scaffold|-reviewer" AGENTS.md
```

Expected: no output. Any hit is a leftover pointer to a deleted skill.

- [ ] **Step 4: Commit**

```bash
cd /mnt/projects/oss/onelitefeather/launchpad
git add AGENTS.md
git commit -m "docs: replace stale skills section in AGENTS.md

The listed ~40 skills were removed in 21ebaef/883d57c. Points at the
knowledge skills that actually exist and keeps the CI gate notes."
```

---

## Done when

- `ls .claude/skills/` shows three or four skill directories, each with a `SKILL.md` under 150 lines.
- `docs/superpowers/baselines/` holds one file per attempted skill, including `nuxt-structure.md` even if that skill was killed.
- `grep -rn "references/" .claude/skills/*/references/` returns nothing.
- `grep -nE "a11y-|perf-|sec-|net-|bp-|privacy-|component-scaffold|-reviewer" AGENTS.md` returns nothing.
- **No boundary violations.** Spec §8 assigns each cross-skill topic a single owner; the others carry a one-line pointer. Check the four highest-risk topics:

  ```bash
  cd /mnt/projects/oss/onelitefeather/launchpad
  grep -rn "useLocaleHead\|rel=canonical\|rel='canonical'" .claude/skills/ | grep -v nuxt-seo
  grep -rn "queryCollection" .claude/skills/ | grep -v nuxt-content-cms
  grep -rn "useAsyncData" .claude/skills/ | grep -v nuxt-structure
  grep -rn "zeroRuntime\|nitro.prerender" .claude/skills/ | grep -v nuxt-seo
  ```

  Each command may return at most one line per non-owning skill — the pointer.
  Two or more lines means the mechanism got duplicated; cut it back to a pointer
  naming the owning skill.
- Every skill's three GREEN re-runs are recorded with no marker firing.
- `git status --short` shows no unintended changes to `nuxt.config.ts`, `content.config.ts`, `assets/css/` or any component — the production defects in spec §11 are untouched.
