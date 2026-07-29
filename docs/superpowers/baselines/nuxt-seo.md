# Baseline: nuxt-seo

Each scenario was run against a fresh `general-purpose` subagent (model: `sonnet`),
read-only, with no knowledge of the skill. The skill directory did not exist on
disk during any RED run.

## Step 1: ground truth

```
$ sed -n '30,45p' node_modules/@nuxtjs/i18n/dist/runtime/kit/head.js
  return metaObject;
}
function createLocaleMap(locales) {
  const localeMap = /* @__PURE__ */ new Map();
  for (const locale of locales) {
    if (!locale.language) {
      console.warn("Locale `language` ISO code is required to generate alternate link");
      continue;
    }
    const [language, region] = locale.language.split("-");
    if (language && region && (locale.isCatchallLocale || !localeMap.has(language))) {
      localeMap.set(language, locale);
    }
    localeMap.set(locale.language, locale);
  }
  return localeMap;

$ grep -n "concat(value)" node_modules/.pnpm/@nuxt+kit@*/node_modules/@nuxt/kit/dist/index.mjs
node_modules/.pnpm/@nuxt+kit@4.4.5_magicast@0.5.3/node_modules/@nuxt/kit/dist/index.mjs:788:  obj[key] = obj[key].concat(value);
node_modules/.pnpm/@nuxt+kit@4.4.6_magicast@0.5.3/node_modules/@nuxt/kit/dist/index.mjs:788:  obj[key] = obj[key].concat(value);
node_modules/.pnpm/@nuxt+kit@4.4.7_magicast@0.5.3/node_modules/@nuxt/kit/dist/index.mjs:788:  obj[key] = obj[key].concat(value);
node_modules/.pnpm/@nuxt+kit@4.4.8_magicast@0.5.3/node_modules/@nuxt/kit/dist/index.mjs:789:  obj[key] = obj[key].concat(value);
# context (4.4.8, lines 786-792):
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = obj[key].concat(value);
    return true;
  }
});
# `merger` is passed straight into c12's `loadConfig({ ..., merger, ...opts })` inside
# `loadNuxtConfig()` — this is the exact merge function `$production` / `$development`
# / `$env.<name>` overlays and layer `extends` go through.

$ grep -n "prerender" nuxt.config.ts || echo "no nitro.prerender"
no nitro.prerender

$ grep -n "useLocaleHead\|rel: 'canonical'\|rel: 'alternate'" layouts/default.vue composables/*.ts
layouts/default.vue:14:const head = useLocaleHead({ dir: true, lang: true, seo: true })
```

No `rel: 'canonical'` or `rel: 'alternate'` literal appears anywhere in `layouts/default.vue`
or `composables/*.ts` — `useLocaleHead` is the sole emitter, confirmed by absence.

Additional ground truth gathered before writing (see task report for full detail):

- `nuxt.config.ts:83-84` and `:206-207` both write `iso: 'de-DE'` / `iso: 'en-US'` inside
  `i18n.locales` — never `language:`. `LocaleObject` (checked in
  `node_modules/@nuxtjs/i18n/dist/types.d.mts`) carries an index signature, so `iso` is not
  a type error.
- `nuxt.config.ts`'s `$production` block restates the **full** `i18n.locales` array
  (`:205-208`), the full `schemaOrg.identity.contactPoint`/`sameAs` (`:254-266`), and the
  full `image.format` array (`:288`) — all of which concatenate with the base config
  under the `merger` above rather than replace it.
- `pnpm-lock.yaml`'s instantiated `@nuxtjs/seo@5.1.4(...)` importer resolves
  `@nuxtjs/robots@6.1.2`, `@nuxtjs/sitemap@8.0.15`, `nuxt-schema-org@6.2.3`,
  `nuxt-og-image@6.5.3`, `nuxt-seo-utils@8.1.11`, `nuxt-site-config@4.0.8`,
  `nuxt-link-checker@5.0.10` — all above the version floors — while the top-level
  `node_modules/@nuxtjs/{robots,sitemap}` (resolved from `package.json`'s own explicit
  `5.7.1`/`7.6.0` devDependency pins) are older. `@nuxtjs/sitemap@8.0.15`'s
  `dist/content.mjs` exports both `asSitemapCollection` (back-compat) and the new
  `defineSitemapSchema`; `@nuxtjs/sitemap@7.6.0`'s only exports `asSitemapCollection`.
- `nuxt.config.ts`'s `ogImage: { zeroRuntime: true }` (`:318-324`) has no accompanying
  `nitro.prerender` anywhere in the file.
- `node_modules/nuxt-og-image/dist/cli.cjs` hardcodes
  `COMMUNITY_TEMPLATES = ["NuxtSeo", "Brutalist", "SimpleBlog"]` and warns "Community
  templates detected that must be ejected for production" — `composables/usePageSeo.ts:105`
  and `composables/useArticleSeo.ts:161` both call `defineOgImage('NuxtSeo', ...)`, and no
  `components/OgImage/NuxtSeo.satori.vue` exists in this repo (only `TeamMember.satori.vue`
  does). `runtime/server/routes/__zero-runtime/image.js` only renders when
  `import.meta.dev || import.meta.prerender`; every other request throws
  `"Not supported in zeroRuntime mode."`.

## Scenario 1: locale objects need `language` (add French)

**Prompt:** Add French as a third locale to this site, alongside German and English.

**Marker:** the diff contains the key `iso:` and no `language:`, and/or
`$production.i18n.locales` is restated with the full locale array.

### RED (no skill)

Marker fired: **yes**, both halves. The agent added French to both `i18n.locales` blocks:

```diff
         locales: [
             {code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json'},
-            {code: 'en', iso: 'en-US', name: 'English', file: 'en.json'}
+            {code: 'en', iso: 'en-US', name: 'English', file: 'en.json'},
+            {code: 'fr', iso: 'fr-FR', name: 'Français', file: 'fr.json'}
         ],
```

applied identically to **both** the base `i18n.locales` array and the `$production.i18n.locales`
array (plus `schemaOrg.identity.contactPoint[0].availableLanguage` in both places too) — using
`iso:` throughout, never `language:`. This reproduces both documented defects at once: the
agent copied the repo's existing (wrong) `iso:` convention, and it restated the whole array in
`$production` instead of leaving the env block to add only what's new (which, under `concat`,
would double every locale it *did* need to touch).

### GREEN (with skill)

See "GREEN runs" below.

---

## Scenario 2: canonical/hreflang ownership (`/partners` page)

**Prompt:** We are adding a `/partners` page. It needs a proper canonical URL and hreflang tags
for both locales.

**Marker:** the string `rel: 'canonical'` or `rel: 'alternate'` appears in any file other than
`layouts/default.vue`.

### RED (no skill)

Marker fired: **no**. The agent read `composables/usePageSeo.ts` (whose own comment already
states "Canonical + hreflang are emitted once, app-wide, by @nuxtjs/i18n... to avoid duplicate
or conflicting link tags") and `layouts/default.vue`, correctly concluded that under
`strategy: 'prefix'` any new file dropped under `pages/` is automatically served at both
`/en/partners` and `/de/partners` and picked up by the existing app-wide `useLocaleHead()` call,
and added only a plain page calling `usePageSeo()` plus two i18n keys — no `rel:` link object
anywhere in the diff.

**Judgement call:** the agent already behaves correctly on this scenario — it did not
hand-roll canonical/hreflang, and it explicitly cited the existing single-emitter comment as
its reason. Per the dispatch protocol, a section written purely to counter this specific
failure would be dropped. However, `Emitter ownership map` is required infrastructure
independent of this one scenario: it is this skill's mandated pointer table (per the plan's
own boundary rule — "a separate `In this repo` block would restate those paths a second time")
and `nuxt-structure`'s "Ownership: layout, app.vue, page" section and `nuxt-content-cms`'s
sitemap-split line both point at this skill by name for exactly this hard rule. I kept the
section, written as plain ownership documentation (which file emits what) plus the one hard
rule the scenario confirms already holds, rather than a defensive warning against a failure
that didn't occur — the same call Task 1 made for "The repository boundary."

### GREEN (with skill)

See "GREEN runs" below.

---

## Scenario 3: `zeroRuntime` preconditions (blank OG images in production)

**Prompt:** Open Graph images come out blank for blog articles in production, though they work
in development. Diagnose and fix it.

**Marker:** the patch contains no `nitro.prerender` block **and** adds no new file under
`components/OgImage/*.satori.vue`.

### RED (no skill)

Marker fired (literally): **no** — the agent's diff adds a `nitro.prerender` block:

```diff
+            prerender: {
+                crawlLinks: true,
+                routes: ['/en', '/de'],
+                failOnError: false
+            },
```

so the first half of the AND is false and the marker as literally written does not fire.

**Judgement call — the underlying failure is still present.** The agent correctly diagnosed
precondition (a) — `zeroRuntime` only renders during `import.meta.dev || import.meta.prerender`,
confirmed by quoting `runtime/server/routes/__zero-runtime/image.js` verbatim — and fixed it with
`nitro.prerender.crawlLinks` seeded from the two locale homepages. It never considered precondition
(b): both `usePageSeo.ts` and `useArticleSeo.ts` (the composable blog articles use) call
`defineOgImage('NuxtSeo', ...)`, and `'NuxtSeo'` is one of `nuxt-og-image`'s three hardcoded
`COMMUNITY_TEMPLATES` (`dist/cli.cjs`) — templates that ship *inside* the module's own
`runtime/app/components/Templates/Community` directory, not as a local `components/OgImage/*`
file, and that the module's own migration tooling flags with "Community templates detected that
must be ejected for production." No new file under `components/OgImage/*.satori.vue` was added
(only `TeamMember.satori.vue`, unrelated to blog, already existed) — so blog OG image generation
during the newly-added prerender crawl is still exercising the un-ejected community template,
not a locally-owned one. I independently verified this is real, first-party-documented behavior
by reading `nuxt-og-image`'s own CLI source (`COMMUNITY_TEMPLATES`, `ejectTemplate`,
`detectCommunityTemplateUsage`), not by inference. This is the mirror image of Task 1's
scenario-1 "structural false positive": here the literal AND-marker's letter didn't fire, but
the failure mode the marker exists to catch — an incomplete `zeroRuntime` fix — did. The
"`zeroRuntime` has three preconditions" section is written to close exactly this gap, using the
`NuxtSeo`/community-template omission as its worked example instead of a hypothetical.

### GREEN (with skill)

See "GREEN runs" below.

---

## GREEN runs (with skill)

Each run below used a fresh `general-purpose` subagent (model: `sonnet`), prefixed with an
instruction to read `.claude/skills/nuxt-seo/SKILL.md` and follow it, and suffixed with the
read-only "return a unified diff" instruction from the dispatch protocol. Diffs were saved under
the scratchpad and grepped for the marker rather than eyeballed.

### Scenario 1: locale objects need `language` (add French)

**First attempt — marker fired.** The agent added `{code: 'fr', iso: 'fr-FR', ...}` — `iso:`,
no `language:` — to the base `i18n.locales` array only (it correctly avoided restating
`$production.i18n.locales`, so that half of the marker did not fire, but the `iso:`/no-`language:`
half did). The agent's own explanation revealed the loophole: it read the skill's "fixing it is
out of scope here" sentence (about the *existing* `de`/`en` entries) as blanket permission to
also use `iso:` for the *new* entry, reasoning that this matched "the existing (buggy but
consistent) convention" and that `composables/useBlogContent.ts`'s `localeCodeFromHreflang`
reads `l.iso`. (That fallback also matches on `hreflang.split('-')[0] === l.code`, so `language:`
would not have broken it — but the skill didn't say so, leaving the door open to that
misreading.)

**Fix.** Reworded "Locale objects need `language`, never `iso`" in `SKILL.md` to state explicitly
that the out-of-scope note covers *migrating the existing* `de`/`en` entries only, and that it
"does not license copying the same mistake into a new entry" — every locale added, first or
fifth, must use `language:`. Trimmed the References section by a few words per line to stay
under the 150-line cap after the addition.

**Re-run — marker did not fire.** The agent added `{code: 'fr', language: 'fr-FR', ...}` to the
base `i18n.locales` array only; no `iso:` on the new entry, no restatement of
`$production.i18n.locales`. It also propagated `'fr'` into
`$production.schemaOrg.identity.contactPoint[0].availableLanguage` (mirroring the base value) —
a residual instance of the same concat-merge structural issue the "Env blocks concatenate
arrays" section warns about, but not what the scenario's literal marker checks (which is scoped
to `i18n.locales`), and it doesn't newly break anything: `$production.schemaOrg.identity` was
*already* a full restatement of the base object before this diff (a pre-existing, explicitly
out-of-scope defect per this baseline's own ground truth), so the array-of-`ContactPoint`-objects
duplication it causes on merge existed already: the agent kept both (already-duplicated)
copies internally consistent rather than fixing or worsening the underlying structure. Judged
as a pass against the literal marker; noted here rather than spun into a third fix/re-run cycle,
consistent with "do not fix the repo's production defects."

### Scenario 2: canonical/hreflang ownership (`/partners` page)

Marker fired: **no**. The agent added `pages/partners.vue` calling `usePageSeo()` with a
translated title/description, plus `partners.*` keys in both locale files, and explicitly cited
the skill's "Emitter ownership map" hard rule in its explanation for why it added no `rel:` link
object. No `rel: 'canonical'` or `rel: 'alternate'` literal anywhere in the diff. Clean pass.

### Scenario 3: `zeroRuntime` preconditions (blank OG images in production)

Marker fired: **no** (both AND-halves addressed, so the marker's negative condition holds). The
agent's diff adds `nitro.prerender` (`crawlLinks: true`, seeded with `/en`/`/de`) **and** ejects
`NuxtSeo` into a new `components/OgImage/NuxtSeo.satori.vue` (copied from the module's own
community template source, matching the `title`/`description` props both `usePageSeo.ts` and
`useArticleSeo.ts` already pass). The agent's explanation named both preconditions explicitly and
attributed the diagnosis to the skill's "`zeroRuntime` has three preconditions" section. Clean
pass on the first run — no loophole to close.
