/**
 * The non-empty segments of a catch-all route param. `/blog/x/` arrives as
 * `['x', '']`, and taking the last segment of that yields no slug at all.
 */
export function catchAllSegments(param: string | string[] | undefined): string[] {
  const list = Array.isArray(param) ? param : [param]
  return list.map((segment) => String(segment ?? '')).filter(Boolean)
}
