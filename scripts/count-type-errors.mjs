/**
 * Counts the distinct TypeScript errors in `vue-tsc -b` output.
 *
 * Build mode checks every project the root tsconfig references, and a file can
 * belong to more than one: everything under `shared/` is in both the app and
 * the shared project, so one mistake there is reported twice. Counting raw
 * `error TS` lines would double it, and the ratchet would then disagree with
 * what a reader of `pnpm typecheck` sees. An error is its location plus its
 * code, and each one counts once.
 *
 * @param {string} output raw stdout of `vue-tsc`
 * @returns {number}
 */
export function countTypeErrors(output) {
  const seen = new Set()
  for (const match of output.matchAll(/^(.+?)\((\d+),(\d+)\): error (TS\d+)/gm)) {
    seen.add(`${match[1]}:${match[2]}:${match[3]}:${match[4]}`)
  }
  return seen.size
}
