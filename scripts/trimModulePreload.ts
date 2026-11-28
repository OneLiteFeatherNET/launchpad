/** The part of a vue-bundle-renderer manifest entry this module reads and writes. */
export interface ManifestChunk {
  imports?: string[]
  isEntry?: boolean
  preload?: boolean
  prefetch?: boolean
}

export type Manifest = Record<string, ManifestChunk>

/**
 * The first view is the entry chunk and what it imports statically: the
 * browser fetches those anyway, so a `<link rel="modulepreload">` for them only
 * moves bytes earlier. Everything else (route and layout chunks, composables
 * shared by the page, components) is fetched while the app hydrates; hinting
 * it from the HTML competes with the hero image on a slow connection.
 */
export function trimModulePreload(manifest: Manifest): Manifest {
  const firstView = new Set<string>()
  const visit = (key: string) => {
    if (firstView.has(key) || !manifest[key]) return
    firstView.add(key)
    manifest[key].imports?.forEach(visit)
  }
  Object.keys(manifest).filter((key) => manifest[key]!.isEntry).forEach(visit)

  const trimmed: Manifest = {}
  for (const [key, chunk] of Object.entries(manifest)) {
    trimmed[key] = firstView.has(key) ? chunk : { ...chunk, preload: false, prefetch: false }
  }
  return trimmed
}
