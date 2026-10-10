// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createI18n } from 'vue-i18n'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import M3Button from '../../layers/base/components/M3Button.vue'
import CookieConsentBanner from '../../layers/consent/components/CookieConsentBanner.vue'
import CookieSettingsButton from '../../layers/consent/components/CookieSettingsButton.vue'

/** Per-test switches, reset before each test; the composable is read at mount. */
const consent = vi.hoisted(() => ({
  visible: true,
  analyticsAllowed: true,
  acceptAll: vi.fn(),
  rejectAll: vi.fn(),
  save: vi.fn(),
  reopen: vi.fn(),
}))

vi.mock('../../layers/consent/composables/useCookieConsent', async () => {
  const { ref } = await import('vue')
  return {
    useCookieConsent: () => ({
      bannerVisible: ref(consent.visible),
      analyticsAllowed: ref(consent.analyticsAllowed),
      acceptAll: consent.acceptAll,
      rejectAll: consent.rejectAll,
      save: consent.save,
      reopen: consent.reopen,
    }),
  }
})

const NuxtLinkStub = defineComponent({
  props: { to: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

const mountBanner = (locale: 'de' | 'en' = 'de') => mount(CookieConsentBanner, {
  global: {
    plugins: [createI18n<false>({ legacy: false, locale, messages: { de, en } })],
    components: { M3Button },
    stubs: { NuxtLinkLocale: NuxtLinkStub },
  },
})

/**
 * German copy as the component renders it. The locale JSON is compiled to
 * message ASTs in this environment, so its raw values are not strings.
 */
const copy = (key: string) => createI18n<false>({ legacy: false, locale: 'de', messages: { de, en } }).global.t(`consent.banner.${key}`)

const buttonLabelled = (wrapper: ReturnType<typeof mountBanner>, label: string) => {
  const match = wrapper.findAllComponents(M3Button).find(button => button.text() === label)
  if (!match) throw new Error(`no button labelled "${label}"`)
  return match
}

const openSettings = async (wrapper: ReturnType<typeof mountBanner>) => {
  await buttonLabelled(wrapper, copy('settings')).trigger('click')
}

beforeEach(() => {
  consent.visible = true
  consent.analyticsAllowed = true
  consent.acceptAll.mockReset()
  consent.rejectAll.mockReset()
  consent.save.mockReset()
  consent.reopen.mockReset()
})

describe('CookieConsentBanner', () => {
  it('shows the German heading', () => {
    expect(mountBanner('de').text()).toContain('Wir verstreuen Kekse!')
  })

  it('shows the English heading', () => {
    expect(mountBanner('en').text()).toContain("We're handing out cookies!")
  })

  it('renders nothing once the choice is stored and the banner is not reopened', () => {
    consent.visible = false
    expect(mountBanner().find('section').exists()).toBe(false)
  })

  it('is a non-modal bar, not a dialog', () => {
    expect(mountBanner().find('[role="dialog"]').exists()).toBe(false)
  })

  it('offers exactly the three choices on the first view', () => {
    const labels = mountBanner().findAllComponents(M3Button).map(button => button.text())
    expect(labels).toHaveLength(3)
    expect(labels).toContain(copy('accept_all'))
    expect(labels).toContain(copy('reject_all'))
    expect(labels).toContain(copy('settings'))
  })

  it('"Her mit den Keksen!" calls acceptAll once', async () => {
    const wrapper = mountBanner()
    await buttonLabelled(wrapper, copy('accept_all')).trigger('click')
    expect(consent.acceptAll).toHaveBeenCalledTimes(1)
  })

  it('"Keine Statistik-Kekse!" calls rejectAll once', async () => {
    const wrapper = mountBanner()
    await buttonLabelled(wrapper, copy('reject_all')).trigger('click')
    expect(consent.rejectAll).toHaveBeenCalledTimes(1)
  })

  it('accepting and opting out share the same button variant', () => {
    const wrapper = mountBanner()
    const variantOf = (label: string) => buttonLabelled(wrapper, label).props('variant')
    expect(variantOf(copy('reject_all'))).toBe(variantOf(copy('accept_all')))
  })

  it('the settings button opens the category view', async () => {
    const wrapper = mountBanner()
    await openSettings(wrapper)
    expect(wrapper.find('input[role="switch"]').exists()).toBe(true)
  })

  it('statistics are on by default in the settings', async () => {
    const wrapper = mountBanner()
    await openSettings(wrapper)
    const statistics = wrapper.findAll('input[role="switch"]')[1]
    expect((statistics?.element as HTMLInputElement | undefined)?.checked).toBe(true)
  })

  it('statistics show as off in the settings when the visitor opted out', async () => {
    consent.analyticsAllowed = false
    const wrapper = mountBanner()
    await openSettings(wrapper)
    const statistics = wrapper.findAll('input[role="switch"]')[1]
    expect((statistics?.element as HTMLInputElement | undefined)?.checked).toBe(false)
  })

  it('the necessary category is on and cannot be switched off', async () => {
    const wrapper = mountBanner()
    await openSettings(wrapper)
    const necessary = wrapper.find('input[role="switch"]')
    expect((necessary.element as HTMLInputElement).checked).toBe(true)
    expect(necessary.attributes('disabled')).toBeDefined()
  })

  it('saving passes the statistics choice made in the settings', async () => {
    const wrapper = mountBanner()
    await openSettings(wrapper)
    await wrapper.findAll('input[role="switch"]')[1]?.setValue(false)
    await buttonLabelled(wrapper, copy('save')).trigger('click')
    expect(consent.save).toHaveBeenCalledWith({ analytics: false })
  })
})

describe('CookieSettingsButton', () => {
  it('reopens the banner when clicked', async () => {
    const wrapper = mount(CookieSettingsButton, {
      global: {
        plugins: [createI18n<false>({ legacy: false, locale: 'en', messages: { de, en } })],
        components: { M3Button },
      },
    })
    await wrapper.findComponent(M3Button).trigger('click')
    expect(consent.reopen).toHaveBeenCalledTimes(1)
  })
})
