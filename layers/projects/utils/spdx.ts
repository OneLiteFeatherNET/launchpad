/**
 * SPDX identifiers the projects are published under. Anything else is free
 * text and has no canonical URL, so it is left out rather than guessed at.
 */
const SPDX_IDS = [
  'AGPL-3.0',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'GPL-2.0',
  'GPL-2.0-only',
  'GPL-2.0-or-later',
  'GPL-3.0',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'LGPL-3.0',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'Apache-2.0',
  'MIT',
  'MPL-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'Unlicense',
  'CC0-1.0'
] as const

const CANONICAL_BY_LOWER = new Map<string, string>(SPDX_IDS.map(id => [id.toLowerCase(), id]))

/** spdx.org page for a license id, or undefined when the id is not a known SPDX identifier. */
export function spdxLicenseUrl(license: string | undefined): string | undefined {
  const canonical = CANONICAL_BY_LOWER.get((license ?? '').toLowerCase())
  return canonical ? `https://spdx.org/licenses/${canonical}.html` : undefined
}
