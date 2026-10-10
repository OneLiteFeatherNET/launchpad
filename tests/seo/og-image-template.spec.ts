import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'
import { schemeColors } from '../helpers/theme'

/**
 * The ejected `NuxtSeo.satori` template is the card every page without its
 * own image is shared with. It must carry OneLiteFeather branding, not the
 * nuxt-og-image demo, and it renders inside an isolated Satori island, so it
 * may not reach for i18n, routing or cookies (see the nuxt-seo skill,
 * references/og-images.md).
 */

const TEMPLATE = 'components/OgImage/NuxtSeo.satori.vue'
const source = readFileSync(join(repoRoot, TEMPLATE), 'utf8')

/** Every `#rrggbb` literal in the template's inline styles, lowercase. */
const hexLiterals = (text: string): string[] => [
  ...new Set([...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map(([hex]) => hex.toLowerCase()))
]

describe('NuxtSeo.satori template branding', () => {
  it('carries no Nuxt SEO wording', () => {
    expect(source, 'the module demo name must be gone from the markup').not.toMatch(/nuxt\s*seo/i)
    expect(source, 'the module demo name must be gone from the markup').not.toMatch(/nuxt-seo/i)
  })

  it('names the site as OneLiteFeather.net', () => {
    expect(source).toContain('OneLiteFeather.net')
  })

  it('draws the repository logo rather than a placeholder mark', () => {
    expect(source, 'the logo is imported from public/images/logo.svg as raw text').toMatch(/public\/images\/logo\.svg\?raw/)
  })

  it('takes its title and description from props only', () => {
    expect(source).toMatch(/defineProps<\{\s*title: string;\s*description\?: string/)
    expect(source, 'no i18n, route, cookie or composable access inside the island')
      .not.toMatch(/useI18n|\$t\(|useRoute|useCookie|useRuntimeConfig|useSiteConfig/)
  })

  it('uses only literal colours that exist in the MD3 scheme', () => {
    // Satori cannot resolve CSS variables, so the palette is copied as
    // literals. Each literal must be a dark-scheme role from tailwind.css,
    // so the card cannot drift from the site without a failing test.
    const darkRoles = new Set([...schemeColors().values()].map(role => role.dark))
    const used = hexLiterals(source)
    expect(used.length).toBeGreaterThan(0)
    expect(used.filter(hex => !darkRoles.has(hex))).toEqual([])
  })

  it('does not use the module demo colour switch for pro cards', () => {
    expect(source).not.toMatch(/isPro|colorMode/)
  })
})
