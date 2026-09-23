import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// Types of the base layer's Material Design 3 primitives (M3*). Kept apart
// from the components so a domain can type a prop it passes through without
// importing a .vue file.

/** MD3 common buttons. `filled` is the default and the strongest emphasis. */
export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'

/** MD3 icon buttons. `standard` has no container. */
export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined'

/** Visible icon-button sizes; the hit area stays at least 48px either way. */
export type IconButtonSize = 'sm' | 'md' | 'lg'

/** MD3 cards. */
export type CardVariant = 'elevated' | 'filled' | 'outlined'

/**
 * MD3 chip types plus `label`, the non-interactive form used for status and
 * category tags (rendered as a span, never focusable).
 */
export type ChipKind = 'assist' | 'filter' | 'suggestion' | 'label'

/** Colour roles a primitive may be tinted with: MD3 accents and brand customs. */
export type M3Color = 'primary' | 'secondary' | 'tertiary' | 'error' | 'brand-orange' | 'brand-purple'

/**
 * Colours of a non-interactive chip label: any role above, or `neutral` — a
 * filled surface for labels that must stay legible over an image.
 */
export type ChipLabelColor = M3Color | 'neutral'

/**
 * A Font Awesome icon as `IconFa` takes it: `'home'` or `['fas', 'home']`
 * for an icon registered in plugins/fontawesome.ts, or an imported icon
 * definition such as `faGithub` for one used in a single place.
 */
export type IconName = string | [string, string] | IconDefinition

/** What decides whether an interactive primitive renders a link or a button. */
export interface InteractiveTagOptions {
  /** Internal route; renders a NuxtLink. */
  to?: string
  /** External URL; renders an <a>. */
  href?: string
  /** Link target; `_blank` adds `rel="noopener noreferrer"`. */
  target?: string
  /** Button type when rendered as a <button>. */
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}
