# Baseline: tailwind-design

Each scenario was run against a fresh `general-purpose` subagent (model: `sonnet`),
read-only, with no knowledge of the skill. The skill directory did not exist on
disk during any RED run.

## Step 1: ground truth

```
$ grep -n -- "--color-" assets/css/tailwind.css
8:    --color-secondary-pink: #EC008B;
9:    --color-secondary-orange: #F7931D;
10:    --color-secondary-purple: #91268F;
11:    --color-secondary-blue: #2A388F;
12:    --color-secondary-cyan: #27A9E1;
14:    --color-brand-primary:  #2A388F; /* tiefes Blau */
15:    --color-brand-secondary:#27A9E1; /* helleres Blau */
16:    --color-brand-accent:   #EC008B; /* magenta */
17:    --color-brand-orange:   #F7931D; /* orange */
18:    --color-brand-purple:   #91268F; /* violett */
19:    --color-white:          #FFFFFF;
22:    --color-bg:             light-dark(#ffffff, #0b1020);
23:    --color-surface:        light-dark(#ffffff, #11162a);
24:    --color-text:           light-dark(#111827, #e5e7eb);
25:    --color-muted:          light-dark(#6b7280, #9aa3b2);
26:    --color-border:         light-dark(#e5e7eb, #1f2743);
28:    --gradient-from: var(--color-secondary-pink);
29:    --gradient-via:  var(--color-secondary-purple);
30:    --gradient-to:   var(--color-secondary-cyan);

$ grep -rEo "\b(bg|text|ring|border)-(primary|secondary|accent)\b" --include="*.vue" components/ pages/ layouts/ | sed 's/.*://' | sort | uniq -c
     11 bg-primary
      3 border-primary
      1 border-secondary
      6 ring-primary
      2 ring-secondary
      8 text-primary
      2 text-secondary

$ grep -rn "var(--color-secondary)" --include="*.vue" --include="*.css" . | grep -v node_modules | wc -l
24

$ grep -rn "@config" assets/css/ nuxt.config.ts || echo "no @config — tailwind.config.mts is inert"
no @config — tailwind.config.mts is inert
```

Additional facts gathered before writing the skill (not part of Step 1's literal
commands, but load-bearing and independently verified):

- `components/base/Chip.vue`'s default (`tonal`) variant is itself one of the
  33 dead-class usages: `'bg-primary/10 text-primary border-primary/20 ...'`.
  This is a real, live worked example, not a hypothetical.
- `tailwind.config.mts` maps `primary`/`secondary`/`accent` to
  `var(--color-brand-*)` — but since nothing `@config`s it, none of that ever
  reaches the compiled CSS. Confirmed by building (`pnpm build`) and grepping
  `.output/public/_nuxt/*.css`: `.bg-brand-primary{background-color:var(--color-brand-primary)}`
  compiles; `.bg-primary{`/`.bg-secondary{` do not appear anywhere.
- The real build output directory for this repo's `cloudflare_module` preset is
  `.output/public/_nuxt/*.css`, not `dist/_nuxt/*.css` — `dist/` never gets
  created. `SKILL.md`'s Verify section uses the confirmed path.
- Tailwind v4's default `dark` variant is literally
  `@media (prefers-color-scheme: dark)` (confirmed in
  `node_modules/tailwindcss/dist/lib.js`), overridable only via
  `@custom-variant dark`. No such override exists in this repo, so every
  `dark:` utility already tracks the OS, same as the `light-dark()` tokens —
  they only agree by coincidence, not by any wiring.
- Shiki's dual-theme code highlighting (`@nuxtjs/mdc` v0.22,
  `runtime/highlighter/shiki.js`) calls `codeToHast` with `defaultColor: false`
  and does auto-generate consuming CSS (`html.dark .shiki span { color:
  var(--shiki-dark); ... }`, injected as an inline `<style>` next to each code
  block) — but that CSS is keyed on a `.dark` **class**, which this app never
  sets anywhere. So code blocks are stuck on `--shiki-default` (github-light)
  regardless of OS preference, confirmed by reading the actual highlighter
  source, not assumed from general Shiki knowledge.

## Scenario 1: token contract (Beta chip badge)

**Prompt:** Add a "Beta" badge chip component in the brand primary color,
following the existing chip styling in this project. It should sit next to the
page title on the blog index.

**Marker:** any emitted class matching
`(bg|text|ring|border|from|to)-(primary|secondary|accent)\b` or `brand-\d{2,3}`.

### RED (no skill)

Literal marker grep result on the saved diff:

```
$ grep -Eo "(bg|text|ring|border|from|to)-(primary|secondary|accent)\b|brand-[0-9]{2,3}" baseline-tailwind-1.diff
bg-primary
text-primary
border-primary
bg-primary
```

**Judgement call:** the marker string matches, but only inside unchanged
*context* lines — the pre-existing `default:` case of `Chip.vue`'s
`variantClasses`, which the agent left untouched. Filtering to added (`+`)
lines only, zero matches. The agent did not copy the dead classes: it read
`Chip.vue`, apparently noticed (though never says so explicitly) that reusing
the `tonal` default wouldn't clearly read as "brand primary," and invented a
new `brand` variant using `bg-brand-primary/10 text-brand-primary
border-brand-primary/20` — real, resolving tokens. It did not, however, land
on the skill's eventual/expected answer (`bg-brand-primary`,
`text-brand-accent`, `bg-secondary-cyan`) — no accent or secondary-cyan
appears, since the prompt only asked for "brand primary." This is a genuine
partial-success case: the underlying failure mode (emitting new dead classes)
did not occur, but the diff independently reconfirms the token-contract
defect is real and live in this exact file, which became the worked example
in `SKILL.md`'s "The token contract" section.

### GREEN (with skill)

```
$ grep -Eo "(bg|text|ring|border|from|to)-(primary|secondary|accent)\b|brand-[0-9]{2,3}" green-tailwind-1.diff
```
(no output — clean)

The agent explicitly cited the skill's token table, called out
`Chip.vue`'s dead `tonal` default by name as the reason it wasn't reused, and
added the same `brand` variant shape as RED, this time built entirely from
`bg-brand-primary/10 text-brand-primary border-brand-primary/20` with no dead
classes anywhere in the diff. No change needed.

---

## Scenario 2: dark mode has two mechanisms (theme toggle)

**Prompt:** Add a light/dark theme toggle button to the site navigation, so
visitors can override their operating system preference.

**Marker:** the diff edits `tailwind.config.mts`, and/or
`assets/css/tailwind.css` gains no `@custom-variant dark` line, and/or the
`light-dark()` tokens in `@theme` are left untouched.

### RED (no skill)

Marker fired: **yes**, on two of the three conditions. The agent built a
fully-functional-looking toggle — `composables/useTheme.ts`, a
`ThemeToggleButton.vue`, a blocking `<head>` script in `app.vue` to avoid a
flash of the wrong theme — that toggles a `.dark` class on `<html>` and
persists the choice to `localStorage`. It never touched
`assets/css/tailwind.css` (no `@custom-variant dark` added) and never touched
the `light-dark()` tokens. The composable's own doc comment states the toggle
works because "Tailwind (`darkMode: 'class'` in `tailwind.config.mts`) ...
already react[s]" to the `.dark` class — which is false: that config file is
never loaded (confirmed in Step 1), and Tailwind v4's actual default `dark`
variant is `@media (prefers-color-scheme: dark)`, not a class selector, absent
a `@custom-variant` override. Every `dark:` utility across the site (and every
`light-dark()`-derived neutral) would keep following the OS after this patch;
only markup wired directly to the new `isDark` ref (none exists besides the
button's own icon swap) would actually change. This exactly reproduces the
failure mode the marker is designed to catch.

### GREEN (with skill)

```
tailwind.config.mts edited?        NOT edited (good)
@custom-variant dark added?        +@custom-variant dark (&:where(.dark, .dark *));
light-dark() tokens addressed?     no light-dark( left in added lines (converted to .dark {} overrides)
```

Marker fired: **no**. The agent added `@custom-variant dark (&:where(.dark,
.dark *));` right after the `@import`, split every `light-dark(a, b)` neutral
in `@theme` into a plain value plus a `.dark { --color-*: b; }` override
block, and left `tailwind.config.mts` untouched — precisely the two-part fix
`SKILL.md`'s "Dark mode: two mechanisms, one OS signal" section describes.
The rest of the toggle (composable, button, head script) is structurally the
same as RED, now actually functional. One minor, non-marker observation: the
new toggle button's own focus ring uses `ring-[var(--color-brand-secondary)]`
(arbitrary value) rather than the plain `ring-brand-secondary` utility
`SKILL.md`'s "Focus rings" section recommends — the agent's own diff
explains this was a deliberate hedge because it could not run `pnpm build`
under this task's read-only constraint. Not a loophole in the marker this
scenario tests; noted for completeness. No change needed to `SKILL.md`.

---

## Scenario 3: unresolvable arbitrary values (invisible focus ring)

**Prompt:** The keyboard focus ring on the main navigation items is
invisible. Fix it.

**Marker:** the patch retains a `var(--color-secondary)` reference without
adding that token to `@theme` and without switching to a defined token such
as `ring-brand-secondary`.

### RED (no skill)

Marker fired: **no** (judgement call). The agent correctly diagnosed the root
cause — `--color-secondary` is never declared, only `--color-secondary-*`
hue variants and `--color-brand-secondary` — and fixed it by adding
`--color-secondary: var(--color-brand-secondary);` to `@theme`. This resolves
every existing `var(--color-secondary)` call site at once (all 24 from Step
1), including the focus ring, so the letter of the marker (an *unresolved*
reference left behind) does not match.

**Judgement call, recorded per ambiguity resolution #5:** this fix is
"right for a debatable reason." It works, and the brief's own marker text
names "adding that token to `@theme`" as an acceptable alternative to
"switching to a defined token." But it's a broader change than the ticket
asked for: defining a bare `--color-secondary` custom property also mints
real `bg-secondary`/`text-secondary`/`ring-secondary`/`border-secondary`
utilities — exactly the class family the token table (Step 1: 5 existing
bad usages of `*-secondary` alone — `border-secondary` ×1, `ring-secondary`
×2, `text-secondary` ×2) says never to use — and does so silently,
resurrecting those call sites' appearance without anyone deciding that was
correct. `SKILL.md`'s "Arbitrary var() classes must resolve" section was
written to prefer the narrower fix (swap the call site to
`ring-brand-secondary`) over adding a new alias token, specifically because
of this side effect — not because the RED run's literal marker fired, but
because the RED run surfaced a real design problem with one of its two
"acceptable" branches. Per the clarified marker rule, this section stays
in `SKILL.md` (spec §7.4 mandates it) but is kept at 8 lines, under the
10-line cap for a mandate without a fired marker — it does not carry the
full 14-line budget.

### GREEN (with skill)

Marker check on the added line:

```
$ grep '^+' green-tailwind-3.diff | grep "var(--color-secondary)"
```
(no output — none retained)

Marker fired: **no**. The agent swapped all six occurrences of
`focus-visible:ring-[var(--color-secondary)]` in
`components/features/navigation/NavigationItem.vue` to
`focus-visible:ring-brand-secondary`, the exact real token named in
`SKILL.md`. It left `@theme` untouched — no new alias token — matching the
narrower fix the skill recommends over RED's global-alias approach. It also
correctly scoped the fix to `NavigationItem.vue` only (as the prompt asked),
noting `NavigationBar.vue`, `Footer.vue`, and `LanguageSelector.vue` share the
same bug but were out of scope. No change needed.

---

## REFACTOR (loophole closing)

All three GREEN runs cleared their markers on the first pass with no loophole
to close — no section required rewriting after GREEN.
