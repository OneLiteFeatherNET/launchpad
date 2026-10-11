// Shared by the footer's text links and the consent "cookie settings" button,
// so a button that opens a dialog reads as one of the links beside it.
export const TEXT_LINK_CLASS
  = 'rounded-extra-small text-body-medium text-on-surface-variant transition-colors '
    + 'hover:text-primary focus-ring'

// Legal row: a 24px hit area (WCAG 2.2 target size) with the text centred in it,
// so links and the button share one box and one baseline. `p-0` strips the
// button's UA padding; it is a no-op on links.
export const LEGAL_LINK_CLASS = `inline-flex min-h-6 items-center p-0 ${TEXT_LINK_CLASS}`
