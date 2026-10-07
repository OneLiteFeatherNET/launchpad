/**
 * Fragment id of a person's card on the community wall. The team page derives
 * the same id from a supporter's name alone, so both sides share this file;
 * keep it top level, see AGENTS.md.
 */
export function personAnchor(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug ? `person-${slug}` : 'person'
}
