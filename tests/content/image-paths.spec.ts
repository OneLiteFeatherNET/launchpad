import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Content images are served through @nuxt/image's Cloudflare provider in
 * production, which fetches the original from `img.onelitefeather.net` — a
 * different origin from the site itself. That origin holds `/images/**` and
 * nothing else.
 *
 * Measured against it directly:
 *
 *   /images/blog/dev-blog-1.webp                      200
 *   /images/community-poi/yggdrasil/krone-innen.webp  200
 *   /community-poi/labyrinth/cover.webp               404
 *   /community-poi/labyrinth/result.webp              404
 *   /community-poi/labyrinth/progress_1.webp          404
 *
 * A file in `public/` is therefore not enough. `public/community-poi/labyrinth/
 * cover.webp` exists in this repository and resolves on the site origin — and
 * still renders as a broken image, because that is not where the picture
 * element looks.
 *
 * The failure is invisible to every check that stops at the repository: the
 * file is there, the path is spelled right, the build passes. Only the browser
 * finds out.
 *
 * Ten content images follow the convention. The ten that do not are all one
 * POI, listed below until its images reach the origin.
 */

const CONTENT_DIRS = ['content']

/** `thumbnail: '/x.webp'`, `headerImage: 'images/y.png'`, gallery `src:` … */
const IMAGE_REFERENCE = /(?:headerImage|thumbnail|image|src):\s*'([^']+\.(?:webp|png|jpe?g|svg))'/g

/**
 * Known offenders, pending upload of `public/community-poi/labyrinth/**` to
 * the image origin (or a move under `/images/`).
 *
 * Listed rather than silently skipped: whoever fixes the origin deletes this
 * entry, and until then these paths cannot be mistaken for working ones.
 */
const AWAITING_UPLOAD = /^\/community-poi\/labyrinth\//

function offenders(): string[] {
  const found: string[] = []
  for (const file of collectSourceFiles(CONTENT_DIRS, ['.md', '.json'])) {
    const text = readFileSync(file, 'utf8')
    IMAGE_REFERENCE.lastIndex = 0
    for (const [, path] of text.matchAll(IMAGE_REFERENCE)) {
      if (AWAITING_UPLOAD.test(path!)) continue
      // Both `/images/…` and `images/…` reach the same origin path.
      if (/^\/?images\//.test(path!)) continue
      found.push(`${relativeToRepo(file)} — ${path}`)
    }
  }
  return found
}

describe('content image paths', () => {
  it('finds the references it checks', () => {
    // Without this, a changed frontmatter key would pass the rule vacuously.
    const all: string[] = []
    for (const file of collectSourceFiles(CONTENT_DIRS, ['.md', '.json'])) {
      IMAGE_REFERENCE.lastIndex = 0
      for (const [, path] of readFileSync(file, 'utf8').matchAll(IMAGE_REFERENCE)) all.push(path!)
    }
    expect(all.length).toBeGreaterThan(15)
    expect(all.some((p) => /^\/?images\//.test(p))).toBe(true)

    // And the exemption must still be describing something real.
    expect(all.some((p) => AWAITING_UPLOAD.test(p))).toBe(true)
  })

  it('are all under the prefix the image origin serves', () => {
    expect(offenders()).toEqual([])
  })
})
