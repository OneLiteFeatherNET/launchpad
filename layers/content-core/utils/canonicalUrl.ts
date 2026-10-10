/** Drops a trailing `/` from the path; only the bare origin keeps its slash. */
export function withoutTrailingSlash(url: string): string {
  const parsed = new URL(url)
  if (parsed.pathname === '/') return parsed.toString()
  parsed.pathname = parsed.pathname.replace(/\/+$/, '')
  return parsed.toString()
}
