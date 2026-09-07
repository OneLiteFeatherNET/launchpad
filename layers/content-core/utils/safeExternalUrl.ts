/**
 * Schemes an author-supplied URL may use before it is bound into an `href`.
 *
 * An allow-list rather than a blocklist. Refusing the name `javascript:`
 * invites `data:`, `vbscript:`, and every encoding that resolves to one of
 * them; naming the three schemes that are wanted ends the argument.
 */
const ALLOWED_PROTOCOLS = new Set(['http:',
  'https:',
  'mailto:'])

/**
 * Returns `value` when it is an absolute URL in an allowed scheme, else `null`.
 *
 * Content URLs are not validated on the way in: @nuxt/content v3 uses the zod
 * declarations in `content.config.ts` as a DDL for the SQLite columns, not as
 * a validator, so `z.string().url()` rejects nothing. Whatever an author
 * writes reaches the template, and the check has to happen here.
 *
 * Parsing with `URL` rather than matching a prefix is deliberate: it applies
 * the same normalisation a browser does, so a scheme wearing a disguise —
 * mixed case, leading whitespace, an embedded newline — either normalises to
 * its real name and is rejected, or fails to parse and is rejected.
 *
 * Relative URLs return `null`. Every caller here is publishing a link to
 * somewhere else, so a bare path is an authoring mistake rather than a
 * shorthand worth honouring.
 */
export function toSafeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  return ALLOWED_PROTOCOLS.has(parsed.protocol) ? trimmed : null
}
