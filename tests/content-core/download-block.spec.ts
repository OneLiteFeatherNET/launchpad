// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import M3Button from '../../layers/base/components/M3Button.vue'
import ResourceList from '../../layers/base/components/ResourceList.vue'
import Download from '../../layers/content-core/components/Download.vue'

/** The `::download` markdown block, spec `blog` — a file a post offers to readers. */

const i18n = (locale: 'de' | 'en' = 'de') => createI18n<false>({ legacy: false, locale, messages: { de, en } })
const global = (locale: 'de' | 'en' = 'de') => ({
  plugins: [i18n(locale)],
  stubs: { IconFa: true },
  components: { M3Button, ResourceList },
})

const schematic = {
  name: 'End-Portal (ohne Umgebung)',
  url: '/community-poi/end-portal/end-portal.litematic',
  format: 'Litematica',
  sizeLabel: 'ca. 590 KB',
}

describe('Download', () => {
  it('shows the name, format, size and link of the file', () => {
    const wrapper = mount(Download, { props: schematic, global: global() })
    const link = wrapper.get(`a[href="${schematic.url}"]`)
    expect(link.attributes('href')).toBe(schematic.url)
    const text = wrapper.text()
    const facts = [
      schematic.name,
      'Litematica',
      'ca. 590 KB',
    ]
    for (const fact of facts) {
      expect(text, `expected "${fact}" in the block`).toContain(fact)
    }
  })

  it('saves an internal file under its name', () => {
    const wrapper = mount(Download, { props: schematic, global: global() })
    expect(wrapper.get('a').attributes('download')).toBe(schematic.name)
  })

  it('labels the action as a download when no kind is given', () => {
    const wrapper = mount(Download, { props: schematic, global: global() })
    expect(wrapper.get('a').text()).toContain('Herunterladen')
  })

  it('is labelled for screen readers in the active locale', () => {
    const wrapper = mount(Download, { props: schematic, global: global('en') })
    expect(wrapper.get('section').attributes('aria-label')).toBe('Downloads')
  })

  it('renders a plain anchor in the server HTML without client code', async () => {
    const app = createSSRApp(defineComponent({ render: () => h(Download, schematic) }))
    app.use(i18n())
    app.component('M3Button', M3Button)
    app.component('ResourceList', ResourceList)
    app.component('IconFa', defineComponent({ render: () => null }))
    const html = await renderToString(app)
    const anchor = html.match(/<a [^>]*>/)?.[0] ?? ''
    expect(anchor).toContain(`href="${schematic.url}"`)
    expect(anchor).toContain(`download="${schematic.name}"`)
  })
})
