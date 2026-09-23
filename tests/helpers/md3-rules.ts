/**
 * The Material Design 3 governance rules as pure functions over source text,
 * so the spec can run them on the tree and on hand-written examples alike.
 * See openspec change `adopt-md3-design-system`, spec
 * `design-system-governance`.
 */

export type Rule = 'palette' | 'dark-colour' | 'shape' | 'elevation' | 'button'

export interface Violation {
  rule: Rule
  line: number
  found: string
  hint: string
}

/** Tailwind's built-in palettes; any `<name>-<step>` of these is a raw colour. */
const PALETTES = [
  'red',
'orange',
'amber',
'yellow',
'lime',
'green',
'emerald',
'teal',
'cyan',
'sky',
  'blue',
'indigo',
'violet',
'purple',
'fuchsia',
'pink',
'rose',
  'slate',
'gray',
'zinc',
'neutral',
'stone',
'mauve',
'olive',
'mist',
'taupe',
]

/** Colour keywords that are always allowed. */
const KEYWORDS = new Set(['transparent',
'current',
'inherit'])

/** Utility prefixes that take a colour, longest first so `ring-offset` wins. */
const COLOUR_PREFIXES = [
  'ring-offset',
'placeholder',
'decoration',
'outline',
'border-t',
'border-r',
'border-b',
  'border-l',
'border-x',
'border-y',
'border-s',
'border-e',
'divide',
'accent',
'shadow',
  'stroke',
'border',
'caret',
'fill',
'from',
'text',
'ring',
'via',
'bg',
'to',
]

/** A bracketed value that is a colour rather than a size or a keyword. */
const ARBITRARY_COLOUR
  = /^\[(?:#|rgb|hsl|oklch|oklab|lab\(|lch\(|color-mix|light-dark|var\(--color-)/

/** MD3 radius steps; everything else Tailwind offers is off-scale. */
const SHAPE_STEPS = new Set(['none',
'full',
'extra-small',
'small',
'medium',
'large',
'extra-large'])
const SHAPE_HINT: Record<string, string> = {
  '': 'rounded-extra-small', 'xs': 'rounded-extra-small', 'sm': 'rounded-extra-small',
  'md': 'rounded-small', 'lg': 'rounded-small', 'xl': 'rounded-medium',
  '2xl': 'rounded-large', '3xl': 'rounded-extra-large', '4xl': 'rounded-extra-large',
}
const ELEVATION_HINT: Record<string, string> = {
  '2xs': 'shadow-elevation-1', 'xs': 'shadow-elevation-1', 'sm': 'shadow-elevation-1',
  '': 'shadow-elevation-2', 'md': 'shadow-elevation-2', 'lg': 'shadow-elevation-3',
  'xl': 'shadow-elevation-4', '2xl': 'shadow-elevation-5', 'inner': 'shadow-none',
}

/** Splits `dark:hover:bg-primary/10` into its variants and the utility. */
function splitVariants(token: string): { variants: string[], utility: string } {
  // Arbitrary variants (`[&_a]:`) may contain colons inside the brackets.
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of token) {
    if (char === '[') depth++
    if (char === ']') depth--
    if (char === ':' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  return { variants: parts, utility: current.replace(/^!/, '') }
}

/** The colour name a utility sets, or null if it does not set a colour. */
function colourName(utility: string, colourTokens: Set<string>): string | null {
  for (const prefix of COLOUR_PREFIXES) {
    if (!utility.startsWith(`${prefix}-`)) continue
    const value = utility.slice(prefix.length + 1).replace(/\/(?:\d+|\[[^\]]+\])$/, '')
    if (ARBITRARY_COLOUR.test(value)) return value
    if (value === 'white' || value === 'black' || KEYWORDS.has(value)) return value
    if (colourTokens.has(value)) return value
    const palette = /^([a-z]+)-\d+$/.exec(value)?.[1]
    if (palette && PALETTES.includes(palette)) return value
    return null
  }
  return null
}

export interface RuleContext {
  /** Every `--color-*` token the theme declares, legacy ones included. */
  colourTokens: Set<string>
  /** The tokens components outside the design system may name. */
  allowedColours: Set<string>
}

/** Rule violations carried by one class token. */
function classViolations(token: string, context: RuleContext): Omit<Violation, 'line'>[] {
  const { variants, utility } = splitVariants(token)
  const found: Omit<Violation, 'line'>[] = []
  const colour = colourName(utility, context.colourTokens)
  const isDark = variants.includes('dark')

  if (colour !== null && !KEYWORDS.has(colour) && !context.allowedColours.has(colour)) {
    found.push({
      rule: 'palette',
      found: token,
      hint: 'use an MD3 colour role (primary, on-surface, surface-container-high, …)',
    })
  }
  if (isDark && (colour !== null || /^(?:shadow|opacity)(?:-|$)/.test(utility))) {
    found.push({
      rule: 'dark-colour',
      found: token,
      hint: 'colour roles switch schemes on their own; drop the dark: variant',
    })
  }

  const radius = /^rounded(?:-(?:[trblse]|tl|tr|bl|br|ss|se|es|ee))?(?:-(.+))?$/.exec(utility)
  if (radius) {
    const step = radius[1] ?? ''
    if (!SHAPE_STEPS.has(step)) {
      found.push({
        rule: 'shape',
        found: token,
        hint: `use an MD3 shape step, nearest: ${SHAPE_HINT[step] ?? 'rounded-medium'}`,
      })
    }
  }

  const shadow = /^shadow(?:-(.+))?$/.exec(utility)
  if (shadow && colour === null) {
    const step = shadow[1] ?? ''
    if (step !== 'none' && !/^elevation-[0-5]$/.test(step)) {
      found.push({
        rule: 'elevation',
        found: token,
        hint: `use an MD3 elevation level, nearest: ${ELEVATION_HINT[step] ?? 'shadow-elevation-1'}`,
      })
    }
  }
  return found
}

/** Opening tags of `name`, attributes included, quote-aware so `=>` is safe. */
function openingTags(text: string, names: string[]): { tag: string, index: number }[] {
  const found: { tag: string, index: number }[] = []
  const start = new RegExp(`<(?:${names.join('|')})(?=[\\s>/])`, 'g')
  for (const match of text.matchAll(start)) {
    let quote: string | null = null
    let end = match.index
    for (; end < text.length; end++) {
      const char = text[end]
      if (quote) {
        if (char === quote) quote = null
      } else if (char === '"' || char === '\'') {
        quote = char
      } else if (char === '>') {
        break
      }
    }
    found.push({ tag: text.slice(match.index, end + 1), index: match.index })
  }
  return found
}

const TOKEN_SPLIT = /[\s"'`{}]+/

/**
 * A tag's own text plus the definitions of any identifiers bound through
 * `:class="name"` or `:class="[name, …]"`, so a class list kept in a script
 * constant counts as the tag's classes.
 */
function tagWithBoundClasses(tag: string, text: string): string {
  const binding = /:class="([^"]*)"/.exec(tag)?.[1] ?? ''
  const names = [...binding.matchAll(/(?<![.\w'-])([A-Za-z_$][\w$]*)(?![\w$'-])/g)]
    .map((match) => match[1] ?? '')
  let resolved = tag
  for (const name of names) {
    const definition = new RegExp(`(?:const|let)\\s+${name}\\s*=([\\s\\S]*?)(?=\\n(?:const|let|function|export|</script>)|\\n\\n)`,).exec(text)
    if (definition?.[1]) resolved += ` ${definition[1]}`
  }
  return resolved
}

/** Does a tag's class list style it as a button (colour, shape or shadow)? */
function isStyledAsButton(tag: string, context: RuleContext, isLink: boolean): boolean {
  const tokens = tag.split(TOKEN_SPLIT).map((token) => splitVariants(token).utility)
  const hasBackground = tokens.some((utility) => utility.startsWith('bg-') && colourName(utility, context.colourTokens) !== null)
  const hasShape = tokens.some((utility) => /^rounded(?:-|$)/.test(utility))
  if (!isLink) {
    const hasColour = tokens.some((utility) => colourName(utility, context.colourTokens) !== null)
    const hasShadow = tokens.some((utility) => /^shadow(?:-|$)/.test(utility))
    return hasColour || hasShape || hasShadow
  }
  // A link counts as a button when it has a filled, rounded, padded box —
  // cards are links too, but pad all sides (p-4) rather than inline (px-3).
  const hasInlinePadding = tokens.some((utility) => /^px-/.test(utility))
  return hasBackground && hasShape && hasInlinePadding
}

/** Every rule violation in one file's text, with 1-based line numbers. */
export function findViolations(text: string, context: RuleContext): Violation[] {
  const violations: Violation[] = []
  text.split('\n').forEach((line, index) => {
    for (const token of line.split(TOKEN_SPLIT)) {
      if (token === '') continue
      for (const violation of classViolations(token, context)) {
        violations.push({ ...violation, line: index + 1 })
      }
    }
  })

  const lineOf = (offset: number) => text.slice(0, offset).split('\n').length
  for (const { tag, index } of openingTags(text, ['button'])) {
    if (isStyledAsButton(tagWithBoundClasses(tag, text), context, false)) {
      violations.push({
        rule: 'button',
        line: lineOf(index),
        found: '<button> with its own colour, shape or shadow',
        hint: 'render it through M3Button or M3IconButton',
      })
    }
  }
  for (const { tag, index } of openingTags(text, ['a',
'NuxtLink',
'NuxtLinkLocale'])) {
    if (isStyledAsButton(tagWithBoundClasses(tag, text), context, true)) {
      violations.push({
        rule: 'button',
        line: lineOf(index),
        found: 'link styled as a button',
        hint: 'render it through M3Button with `to` or `href`',
      })
    }
  }
  return violations
}
