import type { ButtonVariant, ChipKind, IconButtonSize, IconButtonVariant, M3Color } from '../types'

// Class lists of the M3* primitives, one complete string per variant.
//
// Written out in full on purpose: Tailwind finds classes by scanning source
// text, so a class assembled at runtime (`bg-${color}`) never reaches the
// stylesheet. Every value here names only MD3 tokens — colour roles, the
// shape and elevation scales, the type scale — which
// tests/design-system/m3-primitives.spec.ts enforces.

/** Disabled per MD3: content on-surface at 38 %, container on-surface at 12 %. */
const DISABLED_CONTENT
  = 'disabled:text-on-surface/38 aria-disabled:text-on-surface/38 '
    + 'disabled:shadow-none aria-disabled:shadow-none '
    + 'disabled:cursor-not-allowed aria-disabled:pointer-events-none'
const DISABLED_CONTAINER = 'disabled:bg-on-surface/12 aria-disabled:bg-on-surface/12'
const DISABLED_OUTLINE = 'disabled:border-on-surface/12 aria-disabled:border-on-surface/12'

export const M3_BUTTON_BASE
  = 'inline-flex h-10 items-center justify-center gap-2 rounded-full whitespace-nowrap '
    + 'text-label-large select-none transition-shadow duration-150 ease-standard '
    + 'cursor-pointer state-layer focus-ring touch-target'

export const M3_BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  filled: `bg-primary text-on-primary hover:shadow-elevation-1 ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  tonal: `bg-secondary-container text-on-secondary-container hover:shadow-elevation-1 ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  outlined: `border border-outline text-primary ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
  text: `text-primary ${DISABLED_CONTENT}`,
  elevated: `bg-surface-container-low text-primary shadow-elevation-1 hover:shadow-elevation-2 ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
}

/** Horizontal padding, which MD3 narrows on the side that carries an icon. */
export const M3_BUTTON_PADDING: Record<ButtonVariant, { plain: string, withIcon: string }> = {
  filled: { plain: 'px-6', withIcon: 'pl-4 pr-6' },
  tonal: { plain: 'px-6', withIcon: 'pl-4 pr-6' },
  outlined: { plain: 'px-6', withIcon: 'pl-4 pr-6' },
  text: { plain: 'px-3', withIcon: 'pl-3 pr-4' },
  elevated: { plain: 'px-6', withIcon: 'pl-4 pr-6' },
}

export const M3_ICON_BUTTON_BASE
  = 'inline-flex shrink-0 items-center justify-center rounded-full '
    + 'cursor-pointer transition-colors duration-150 ease-standard state-layer focus-ring touch-target'

export const M3_ICON_BUTTON_SIZES: Record<IconButtonSize, { box: string, icon: string }> = {
  sm: { box: 'size-8', icon: 'size-4' },
  md: { box: 'size-10', icon: 'size-5' },
  lg: { box: 'size-12', icon: 'size-6' },
}

/**
 * Per variant: the look as a plain button, and — when used as a toggle — the
 * unselected and selected looks MD3 specifies.
 */
export const M3_ICON_BUTTON_VARIANTS: Record<
  IconButtonVariant,
  { plain: string, unselected: string, selected: string }
> = {
  standard: {
    plain: `text-on-surface-variant ${DISABLED_CONTENT}`,
    unselected: `text-on-surface-variant ${DISABLED_CONTENT}`,
    selected: `text-primary ${DISABLED_CONTENT}`,
  },
  filled: {
    plain: `bg-primary text-on-primary ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
    unselected: `bg-surface-container-highest text-primary ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
    selected: `bg-primary text-on-primary ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  },
  tonal: {
    plain: `bg-secondary-container text-on-secondary-container ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
    unselected: `bg-surface-container-highest text-on-surface-variant ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
    selected: `bg-secondary-container text-on-secondary-container ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  },
  outlined: {
    plain: `border border-outline text-on-surface-variant ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
    unselected: `border border-outline text-on-surface-variant ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
    selected: `bg-inverse-surface text-inverse-on-surface ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  },
}

export const M3_CHIP_BASE
  = 'inline-flex h-8 items-center gap-2 rounded-small border text-label-large whitespace-nowrap'

/** Interactive chips add the state layer and focus ring; labels do not. */
export const M3_CHIP_INTERACTIVE = 'cursor-pointer state-layer focus-ring touch-target transition-colors duration-150 ease-standard'

export const M3_CHIP_KINDS: Record<Exclude<ChipKind, 'label'>, { plain: string, selected: string }> = {
  assist: {
    plain: `border-outline text-on-surface px-4 ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
    selected: `border-outline text-on-surface px-4 ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
  },
  suggestion: {
    plain: `border-outline text-on-surface-variant px-4 ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
    selected: `border-transparent bg-secondary-container text-on-secondary-container px-4 ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  },
  filter: {
    plain: `border-outline text-on-surface-variant px-4 ${DISABLED_OUTLINE} ${DISABLED_CONTENT}`,
    selected: `border-transparent bg-secondary-container text-on-secondary-container pl-2 pr-4 ${DISABLED_CONTAINER} ${DISABLED_CONTENT}`,
  },
}

/** A non-interactive label without a colour: outlined and neutral. */
export const M3_CHIP_LABEL_NEUTRAL = 'border-outline-variant text-on-surface-variant px-3'

/** A non-interactive label tinted with a role: its container colours. */
export const M3_CHIP_LABEL_COLORS: Record<M3Color, string> = {
  'primary': 'border-transparent bg-primary-container text-on-primary-container px-3',
  'secondary': 'border-transparent bg-secondary-container text-on-secondary-container px-3',
  'tertiary': 'border-transparent bg-tertiary-container text-on-tertiary-container px-3',
  'error': 'border-transparent bg-error-container text-on-error-container px-3',
  'brand-orange': 'border-transparent bg-brand-orange-container text-on-brand-orange-container px-3',
  'brand-purple': 'border-transparent bg-brand-purple-container text-on-brand-purple-container px-3',
}
