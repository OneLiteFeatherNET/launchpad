// Class lists of the navigation's items — the links in the bar, the mobile
// panel and the bottom bar, and the triggers of the "more" and language
// menus that sit among them. One place, so all of them share the MD3
// navigation look: pill-shaped, on-surface-variant at rest, the active
// indicator in secondary-container, state layer and focus ring from the
// design system.
//
// These are navigation items, not buttons; the M3Button look would set them
// apart from the links they sit between.
//
// The item classes carry no text colour: combine one with exactly one of
// NAV_ITEM_INACTIVE or NAV_ITEM_ACTIVE. Two text colours on one element are
// resolved by stylesheet order, not class order, so the active colour could
// silently lose.

/** A top-bar item: link, "more" summary or language trigger. */
export const NAV_ITEM_DESKTOP
  = 'inline-flex h-10 items-center gap-2 rounded-full px-3 text-label-large '
    + 'no-underline cursor-pointer state-layer focus-ring '
    + 'transition-colors duration-150 ease-standard'

/** An item in the mobile panel. */
export const NAV_ITEM_MOBILE
  = 'flex w-full items-center gap-3 rounded-full px-4 py-3 text-body-large '
    + 'no-underline state-layer focus-ring '
    + 'transition-colors duration-150 ease-standard'

/** An item in the bottom bar. */
export const NAV_ITEM_BOTTOM
  = 'relative flex flex-col items-center justify-center gap-1 rounded-medium px-3 py-2 '
    + 'text-center text-label-medium no-underline state-layer '
    + 'focus-ring transition-colors duration-150 ease-standard'

/** An item at rest. */
export const NAV_ITEM_INACTIVE = 'text-on-surface-variant'

/** The active indicator: the current page's item. */
export const NAV_ITEM_ACTIVE = 'bg-secondary-container text-on-secondary-container'

/**
 * An entry inside a dropdown menu. The focus ring is drawn inside the item:
 * the menu clips its overflow, so an outer ring would be cut off.
 */
export const NAV_MENU_ITEM
  = 'flex items-center gap-3 px-4 py-2 text-label-large text-on-surface no-underline '
    + 'state-layer focus-visible:outline-3 focus-visible:-outline-offset-3 '
    + 'focus-visible:outline-secondary'

/** The surface of a dropdown menu (MD3 menu: container, elevation 2). */
export const NAV_MENU_SURFACE
  = 'absolute right-0 mt-2 overflow-hidden rounded-small bg-surface-container py-2 shadow-elevation-2'
