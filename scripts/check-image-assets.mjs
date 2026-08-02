#!/usr/bin/env node
/**
 * Refuses a published build that cannot serve its own images.
 *
 * Most images referenced from content/ are not in this repository; they live
 * behind the img.onelitefeather.net proxy and are only reachable when
 * @nuxt/image runs with the `cloudflare` provider. Under `none` those paths
 * are emitted verbatim and 404.
 *
 * Runs before every build. It fails only when a build is both published and
 * unable to resolve an image — a local or GitHub Actions build stays a
 * warning, because nothing there is served to visitors.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content')
const PUBLIC = join(ROOT, 'public')

// Mirrors the resolution in nuxt.config.ts. Keep the two in step.
const isCloudflareBuild = process.env.WORKERS_CI === '1'
const provider = (process.env.NUXT_IMAGE_PROVIDER ?? (isCloudflareBuild ? 'cloudflare' : 'none')) === 'cloudflare'
  ? 'cloudflare'
  : 'none'

/** Every /images/... path referenced by a content file. */
function collectReferences(dir, found = new Map()) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      collectReferences(full, found)
      continue
    }
    if (!/\.(md|json|ya?ml)$/.test(entry)) continue
    const text = readFileSync(full, 'utf8')
    for (const match of text.matchAll(/["'](\/images\/[^"']+)["']/g)) {
      const path = match[1]
      if (!found.has(path)) found.set(path, [])
      found.get(path).push(full.replace(`${ROOT}/`, ''))
    }
  }
  return found
}

const references = existsSync(CONTENT) ? collectReferences(CONTENT) : new Map()
const missing = [...references.entries()].filter(([path]) => !existsSync(join(PUBLIC, path)))

console.log(`\nImage assets: provider "${provider}", ${references.size} referenced, ${missing.length} not in public/.`)

if (missing.length === 0) {
  console.log('Every referenced image resolves locally.\n')
  process.exit(0)
}

if (provider === 'cloudflare') {
  console.log('Served through img.onelitefeather.net — not required locally.\n')
  process.exit(0)
}

for (const [path, sources] of missing) {
  console.log(`  ${path}\n    referenced by ${sources.join(', ')}`)
}

if (!isCloudflareBuild) {
  console.log('\nProvider is "none" and these files are absent, so they will 404 in this'
    + '\nbuild. Harmless locally and in GitHub Actions, where nothing is served to'
    + '\nvisitors — this is a warning, not a failure.\n')
  process.exit(0)
}

console.log('\nThis build runs on Cloudflare Workers Builds and its output is published,'
  + '\nbut the provider is "none" and the images above are not in public/. Visitors'
  + '\nwould get 404s. Either drop the NUXT_IMAGE_PROVIDER override so the build'
  + '\ndefaults to "cloudflare", or commit the files to public/.\n')
process.exit(1)
