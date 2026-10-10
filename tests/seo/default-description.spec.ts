// @vitest-environment nuxt
import { readFileSync } from 'node:fs'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, unref } from 'vue'
import { usePageSeo } from '../../layers/content-core/composables/usePageSeo'
import { repoRoot } from '../helpers/sources'

interface LocaleFile {
  seo: { default_description: string }
  nuxtSiteConfig?: { description?: string }
}

const messages = (code: string): LocaleFile => JSON.parse(readFileSync(`${repoRoot}/i18n/locales/${code}.json`, 'utf8'))

const DE_DEFAULT = messages('de').seo.default_description

// The static English site description that nuxt.config.ts declares. Tests
// override it to prove the page default does not come from it.
let siteDescriptionOverride: string | undefined
let seoMeta: Record<string, unknown> = {}

mockNuxtImport('useSiteConfig', (original) => () => {
  const site = original()
  if (siteDescriptionOverride === undefined) return site
  return new Proxy(site, {
    get: (target, key) => (key === 'description' ? siteDescriptionOverride : Reflect.get(target, key))
  })
})

mockNuxtImport('useSeoMeta', (original) => (input: Record<string, unknown>) => {
  seoMeta = input
  return original(input as Parameters<typeof original>[0])
})

const probe = defineComponent({
  setup() {
    usePageSeo({ title: 'Imprint' })
    return () => h('div')
  }
})

const renderDescription = async (route: string): Promise<string> => {
  await mountSuspended(probe, { route })
  await flushPromises()
  return String(unref(seoMeta.description))
}

beforeEach(() => {
  siteDescriptionOverride = undefined
  seoMeta = {}
  // Nuxt OG image's compiler macro; the test environment has no transform for it.
  vi.stubGlobal('defineOgImage', () => undefined)
})

describe('default page description', () => {
  it('is the German default for a German page without its own description', async () => {
    expect(await renderDescription('/de/imprint')).toBe(DE_DEFAULT)
  })

  it('prefers the localised default over the static site description', async () => {
    siteDescriptionOverride = 'Static English site description'
    expect(await renderDescription('/de/imprint')).toBe(DE_DEFAULT)
  })

  it('gives WebSite the German description on German pages', () => {
    expect(messages('de').nuxtSiteConfig?.description).toBe(DE_DEFAULT)
  })
})
