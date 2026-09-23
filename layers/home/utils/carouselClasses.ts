// Class lists shared by the carousel's slides (blog, news, event, POI) and
// its controls. The four slide types are one design — an image, a scrim for
// its lower edge, a caption card — so they read these instead of each
// carrying its own copy.
//
// The caption follows the colour scheme (a light card in light mode, a dark
// one in dark mode) rather than sitting white-on-black in both: over an
// arbitrary photo, a near-opaque surface is what guarantees the text
// contrast the roles promise.

/** Darkens the image's lower edge so the caption card reads as lifted off it. */
export const CAROUSEL_SCRIM
  = 'absolute inset-0 bg-gradient-to-t from-scrim/60 via-scrim/20 to-transparent'

/**
 * What a slide keeps free at its bottom edge, set once on the carousel frame:
 * the indicator bar (bottom-2 + py-2 + size-6 = 3.5rem) plus a gap. Slides
 * read it rather than guessing their own padding — the image slide's guess
 * used to sit level with the dots.
 */
export const CAROUSEL_DOTS_SPACE = '[--carousel-dots-space:4.5rem] sm:[--carousel-dots-space:5rem]'

/** Positions the caption above the dots. */
export const CAROUSEL_CAPTION_POSITION
  = 'absolute inset-x-0 bottom-0 p-5 pb-(--carousel-dots-space) sm:p-6 sm:pb-(--carousel-dots-space)'

/** The caption card itself. */
export const CAROUSEL_CAPTION
  = 'max-w-3xl rounded-large bg-surface-container-high/90 p-4 text-on-surface '
    + 'shadow-elevation-2 backdrop-blur-sm'

/** The row of tags and meta data above the title. */
export const CAROUSEL_META
  = 'mb-2 flex flex-wrap items-center gap-2 text-label-medium uppercase text-on-surface-variant'

/** The slide title. */
export const CAROUSEL_TITLE = 'mb-2 text-headline-small'

/** The title's link. */
export const CAROUSEL_TITLE_LINK = 'rounded-extra-small hover:underline focus-ring'

/** Supporting text under the title. */
export const CAROUSEL_TEXT = 'mb-3 line-clamp-3 text-body-large text-on-surface-variant'

/** The pill that holds the pause control and the dots. */
export const CAROUSEL_INDICATOR_BAR
  = 'flex items-center gap-2 rounded-full bg-surface-container-high/80 px-3 py-2 '
    + 'shadow-elevation-1 backdrop-blur-sm'

/** Pause/play and the dots: small controls on the indicator bar. */
export const CAROUSEL_INDICATOR_BUTTON
  = 'group grid size-6 cursor-pointer place-items-center rounded-full text-on-surface focus-ring'

/** A dot, current or not. */
export const CAROUSEL_DOT = 'size-3.5 rounded-full transition-colors duration-150 ease-standard'
export const CAROUSEL_DOT_CURRENT = 'bg-primary'
export const CAROUSEL_DOT_OTHER = 'bg-on-surface-variant/40 group-hover:bg-on-surface-variant/70'
