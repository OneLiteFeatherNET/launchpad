import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, resolved from this file rather than process.cwd(). */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/** Strips the repository root, so assertion diffs stay readable. */
export function relativeToRepo(file: string): string {
  return file.startsWith(`${repoRoot}/`) ? file.slice(repoRoot.length + 1) : file
}

/**
 * Absolute paths of every file under `dirs` whose name ends in one of
 * `extensions`. Used by tests that assert a rule across the whole tree, where
 * a hand-maintained file list would silently rot.
 */
export function collectSourceFiles(dirs: string[], extensions: string[]): string[] {
  const found: string[] = []
  for (const dir of dirs) walk(join(repoRoot, dir), extensions, found)
  return found.sort()
}

function walk(dir: string, extensions: string[], found: string[]): void {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full, extensions, found)
      continue
    }
    if (extensions.some((ext) => entry.endsWith(ext))) found.push(full)
  }
}
