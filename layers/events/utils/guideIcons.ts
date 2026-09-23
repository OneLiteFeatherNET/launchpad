import type { IconName } from '#layers/base'

/**
 * Role icons an author may name in `::event-guide{icon="…"}`. Markdown hands
 * over a plain string, which the FontAwesome registry check cannot see, so
 * only the names listed here are accepted — each written as a literal the
 * check does see — and anything else falls back to a neutral icon.
 */
const GUIDE_ICONS: Record<string, IconName> = {
  'person-running': ['fas', 'person-running'],
  'ghost': ['fas', 'ghost'],
  'skull': ['fas', 'skull'],
  'shield-halved': ['fas', 'shield-halved'],
  'hammer': ['fas', 'hammer'],
  'user': ['fas', 'user'],
}

const FALLBACK: IconName = ['fas', 'circle-info']

export function guideIcon(name: string | undefined): IconName {
  return (name && GUIDE_ICONS[name]) || FALLBACK
}

/** Injection key: whether the enclosing guide group currently shows tabs. */
export const GUIDE_TABS_KEY = Symbol('event-guide-tabs')
