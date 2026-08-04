/**
 * Whether a navigation link points at the page currently shown.
 *
 * Prefix matching is what makes a section link stay lit on its own subpages —
 * `/de/team` should remain current on `/de/team/someone`. Applied to the
 * locale root it does the opposite of what anyone wants: `/de` is a prefix of
 * every page in that locale, so the home link would be current everywhere.
 *
 * So a link matches by prefix only if it has a segment of its own below the
 * locale root; anything shallower has to match exactly.
 */
export function isCurrentNavPath(routePath: string, linkPath: string): boolean {
  if (!linkPath || linkPath === '#') return false
  if (routePath === linkPath) return true

  // '/de' -> ['de'], '/de/team' -> ['de', 'team']
  const segments = linkPath.split('/').filter(Boolean)
  if (segments.length < 2) return false

  return routePath.startsWith(`${linkPath}/`)
}
