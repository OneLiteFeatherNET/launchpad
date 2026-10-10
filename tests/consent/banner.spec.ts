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

const consent = vi.hoisted(() => ({
  acceptAll: vi.fn(),
  rejectAll: vi.fn(),
  save: vi.fn(),
  reopen: vi.fn(),
}))

vi.mock('../../layers/consent/composables/useCookieConsent', async () => {
  const { ref } = await import('vue')
  return {
    useCookieConsent: () => ({
      bannerVisible: ref(true),
      analyticsAllowed: ref(false),
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

  it('accepting all calls acceptAll once', async () => {
    const wrapper = mountBanner()
    await buttonLabelled(wrapper, copy('accept_all')).trigger('click')
    expect(consent.acceptAll).toHaveBeenCalledTimes(1)
  })

  it('rejecting all calls rejectAll once', async () => {
    const wrapper = mountBanner()
    await buttonLabelled(wrapper, copy('reject_all')).trigger('click')
    expect(consent.rejectAll).toHaveBeenCalledTimes(1)
  })

  it('gives accepting and rejecting the same button variant', () => {
    const wrapper = mountBanner()
    const variantOf = (label: string) => buttonLabelled(wrapper, label).props('variant')
    expect(variantOf(copy('reject_all'))).toBe(variantOf(copy('accept_all')))
  })

  it('the settings button opens the category view', async () => {
    const wrapper = mountBanner()
    await openSettings(wrapper)
    expect(wrapper.find('input[role="switch"]').exists()).toBe(true)
  })

  it('statistics are off by default in the settings', async () => {
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
    await wrapper.findAll('input[role="switch"]')[1]?.setValue(true)
    await buttonLabelled(wrapper, copy('save')).trigger('click')
    expect(consent.save).toHaveBeenCalledWith({ analytics: true })
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
