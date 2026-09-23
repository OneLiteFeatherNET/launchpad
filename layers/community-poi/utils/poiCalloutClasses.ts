// The POI page's callouts — goal, current state, lore, how to contribute,
// collaboration — share one look: a role container with a left accent bar.
// Each used to mix its own tint with color-mix() and pick text colours by
// hand per scheme; a role container and its on-colour come with a contrast
// guarantee the contrast test checks instead.

export type PoiCalloutTone = 'primary' | 'secondary' | 'brand-orange' | 'brand-purple'

/** The box: container colour, accent bar, text in the matching on-colour. */
export const POI_CALLOUT: Record<PoiCalloutTone, string> = {
  'primary':
    'rounded-medium border-l-4 border-primary bg-primary-container p-5 text-on-primary-container',
  'secondary':
    'rounded-medium border-l-4 border-secondary bg-secondary-container p-5 text-on-secondary-container',
  'brand-orange':
    'rounded-medium border-l-4 border-brand-orange bg-brand-orange-container p-5 '
    + 'text-on-brand-orange-container',
  'brand-purple':
    'rounded-medium border-l-4 border-brand-purple bg-brand-purple-container p-5 '
    + 'text-on-brand-purple-container',
}

/** A callout's small uppercase heading; takes the box's on-colour. */
export const POI_CALLOUT_LABEL = 'inline-flex items-center gap-2 text-title-small uppercase'

/** A callout's regular heading. */
export const POI_CALLOUT_TITLE = 'inline-flex items-center gap-2 text-title-medium'

/** Body text inside a callout. */
export const POI_CALLOUT_BODY = 'mt-1 whitespace-pre-line text-body-medium'

/** A link inside a callout: the box's on-colour, underlined, design-system focus ring. */
export const POI_CALLOUT_LINK
  = 'inline-flex items-center gap-1.5 rounded-extra-small underline underline-offset-2 '
    + 'hover:decoration-2 focus-ring'
