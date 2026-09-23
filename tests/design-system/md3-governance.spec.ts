import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateTokens } from '../../scripts/md3-tokens.mjs'
import { findViolations, type Rule, type RuleContext } from '../helpers/md3-rules'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'
import { themeCss } from '../helpers/theme'

/**
 * Style decisions — colour, shape, elevation, what a button looks like —
 * belong to the design tokens and to the M3* primitives in the base layer.
 * Everywhere else only lays out and fills them. Four rules make that
 * checkable (spec `design-system-governance`):
 *
 *   palette      colour utilities name an MD3 role or custom colour, never a
 *                Tailwind palette, white/black or a bracketed colour
 *   dark-colour  no dark: variant on a colour, shadow or opacity utility —
 *                the roles switch schemes on their own
 *   shape        radii come from the MD3 shape scale
 *   elevation    shadows come from the MD3 elevation scale
 *   button       <button> and button-styled links go through a primitive
 *
 * The tree broke all of them when the rules arrived, so PENDING_MIGRATION
 * records who still does. It can only shrink: a new file cannot join it, and
 * an entry that no longer applies fails until it is removed. When it is
 * empty the migration is done and the list goes.
 */

const SOURCE_DIRS = [
  'layers',
  'pages',
  'layouts',
]

/** The design system itself: primitives may use whatever they need. */
const DESIGN_SYSTEM = 'layers/base/'

/**
 * Files that still break a rule, and which rules. Alphabetical, one file per
 * line, so parallel migrations merge cleanly.
 */
const PENDING_MIGRATION: Record<string, Rule[]> = {
  'error.vue': [
    'palette',
    'dark-colour',
    'elevation',
    'button',
  ],
  'layers/content-core/components/ProseA.vue': [
    'palette',
    'dark-colour',
    'shape',
  ],
  'layers/content-core/components/ProseHeading.vue': [
    'palette',
    'dark-colour',
    'shape',
  ],
  'layers/content-core/components/ProseLi.vue': ['palette', 'dark-colour'],
  'layers/content-core/components/ProseList.vue': ['palette', 'dark-colour'],
  'layers/content-core/components/ProseP.vue': ['palette', 'dark-colour'],
  'layers/content-core/components/ProsePre.vue': [
    'palette',
    'dark-colour',
    'shape',
  ],
  'layouts/default.vue': ['palette', 'dark-colour'],
  'pages/imprint.vue': [
    'palette',
    'dark-colour',
    'shape',
  ],
  'pages/privacy.vue': ['palette', 'dark-colour'],
}

/**
 * Raw <button>s or button-styled links that are deliberately not primitives,
 * with the reason. Printed as test names so every exception stays visible.
 */
const BUTTON_EXCEPTIONS: Record<string, string> = {
  'layers/home/components/Carousel.vue':
    'pause toggle and slide dots on the indicator bar over the image; MD3 has no carousel indicator',
  'layers/sponsoring/components/Sponsoring.vue':
    'slide dots of the sponsor carousel; like the home carousel\'s, no MD3 counterpart',
  'layers/navigation/components/LanguageSelector.vue':
    'menu trigger among the navigation links; shares their look (NAV_ITEM_DESKTOP), not a button\'s',
}

function checkedFiles(): string[] {
  return collectSourceFiles(SOURCE_DIRS, ['.vue'])
    .concat([join(repoRoot, 'error.vue')])
    .filter((file) => !relativeToRepo(file).startsWith(DESIGN_SYSTEM))
}

function ruleContext(): RuleContext {
  const colourTokens = new Set([...themeCss().matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((match) => match[1] ?? ''),)
  return { colourTokens, allowedColours: new Set(Object.keys(generateTokens())) }
}

/** Violations per checked file, button exceptions already taken out. */
function violationsByFile() {
  const context = ruleContext()
  const result = new Map<string, ReturnType<typeof findViolations>>()
  for (const file of checkedFiles()) {
    const path = relativeToRepo(file)
    const violations = findViolations(readFileSync(file, 'utf8'), context)
      .filter((violation) => !(violation.rule === 'button' && path in BUTTON_EXCEPTIONS))
    result.set(path, violations)
  }
  return result
}

describe('MD3 governance', () => {
  const byFile = violationsByFile()

  it('checks the whole tree', () => {
    expect(byFile.size).toBeGreaterThan(40)
  })

  it('is broken by no file beyond the pending migration', () => {
    const unexpected: string[] = []
    for (const [path, violations] of byFile) {
      const pending = PENDING_MIGRATION[path] ?? []
      for (const violation of violations) {
        if (pending.includes(violation.rule)) continue
        unexpected.push(`${path}:${violation.line} [${violation.rule}] ${violation.found} — ${violation.hint}`,)
      }
    }
    expect(unexpected).toEqual([])
  })

  it('lists only files and rules that still apply', () => {
    // A migrated file left on the list would let it regress unnoticed.
    const stale: string[] = []
    for (const [path, rules] of Object.entries(PENDING_MIGRATION)) {
      const violations = byFile.get(path)
      if (!violations) {
        stale.push(`${path}: file no longer exists — remove the entry`)
        continue
      }
      for (const rule of rules) {
        if (!violations.some((violation) => violation.rule === rule)) {
          stale.push(`${path}: [${rule}] no longer broken — remove it from PENDING_MIGRATION`)
        }
      }
    }
    expect(stale).toEqual([])
  })

  it.each(Object.entries(BUTTON_EXCEPTIONS))('allows a raw button in %s: %s', (path) => {
    expect(byFile.has(path)).toBe(true)
  })
})

describe('MD3 governance rules', () => {
  const context: RuleContext = {
    colourTokens: new Set(['primary',
'on-surface-variant',
'surface-container',
'muted']),
    allowedColours: new Set(['primary',
'on-surface-variant',
'surface-container']),
  }
  const rulesIn = (text: string) => findViolations(text, context).map((v) => v.rule)

  it('rejects a raw palette colour and accepts a role', () => {
    const [violation] = findViolations('<p class="mt-2 text-gray-600">', context)
    expect(violation).toMatchObject({ rule: 'palette', line: 1, found: 'text-gray-600' })
    expect(rulesIn('<p class="text-on-surface-variant">')).toEqual([])
  })

  it('rejects white, black, bracketed colours and legacy tokens', () => {
    expect(rulesIn('<div class="bg-white/80 border-black/5">')).toEqual(['palette', 'palette'])
    expect(rulesIn('<div class="ring-[var(--color-brand-secondary)] text-[#fff]">'))
      .toEqual(['palette', 'palette'])
    expect(rulesIn('<p class="text-muted">')).toEqual(['palette'])
  })

  it('ignores class names that only appear in comments', () => {
    const text = [
      '<!-- the rounded container, text-gray-600 -->',
      '<script setup lang="ts">',
      '// shadow-lg would be too much here',
      '/* bg-white */',
      "const url = 'https://example.org'",
      '</script>',
    ].join('\n')
    expect(rulesIn(text)).toEqual([])
  })

  it('ignores utilities that only look like colours', () => {
    expect(rulesIn('<p class="text-sm text-[13px] border-2 bg-cover ring-2 text-gradient-brand">'))
      .toEqual([])
  })

  it('rejects a coloured dark: variant but not a structural one', () => {
    expect(rulesIn('<div class="dark:bg-primary">')).toEqual(['dark-colour'])
    expect(rulesIn('<img class="dark:hidden">')).toEqual([])
  })

  it('names the nearest MD3 step for an off-scale radius or shadow', () => {
    const [shape] = findViolations('<div class="rounded-2xl">', context)
    expect(shape?.hint).toMatch(/rounded-large/)
    const [elevation] = findViolations('<div class="shadow-lg">', context)
    expect(elevation?.hint).toMatch(/shadow-elevation-3/)
    expect(rulesIn('<div class="rounded-medium shadow-elevation-1 rounded-full shadow-none">'))
      .toEqual([])
  })

  it('rejects a styled raw button, also through a class constant', () => {
    expect(rulesIn('<button type="button" class="bg-primary px-4">Go</button>'))
      .toContain('button')
    const viaConstant = [
      '<button :class="buttonClass" @click="() => go()">Go</button>',
      '<script setup lang="ts">',
      'const buttonClass = \'rounded-full\'',
      '</script>',
    ].join('\n')
    expect(rulesIn(viaConstant)).toContain('button')
    expect(rulesIn('<button type="button" class="absolute inset-0" />')).toEqual([])
  })

  it('rejects a link styled as a button but not a card link', () => {
    expect(rulesIn('<a href="/x" class="bg-primary px-3 py-2 rounded-full">Apply</a>'))
      .toEqual(['button'])
    expect(rulesIn('<NuxtLink to="/x" class="block p-4 rounded-medium bg-primary">'))
      .toEqual([])
  })

  it('shows a registered exception with its reason', () => {
    // The exception mechanism in miniature: a styled button that would fail
    // is let through once its file carries a reason.
    const exceptions: Record<string, string> = { 'x.vue': 'native dialog close control' }
    const violations = findViolations('<button class="rounded-lg">x</button>', context)
      .filter((violation) => !(violation.rule === 'button' && 'x.vue' in exceptions))
    expect(violations.map((v) => v.rule)).toEqual(['shape'])
    expect(Object.values(exceptions)).toEqual(['native dialog close control'])
  })
})
