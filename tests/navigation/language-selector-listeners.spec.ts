// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import LanguageSelector from '../../layers/navigation/components/LanguageSelector.vue'

const GLOBAL_TARGETS = () => [document, window] as const

/** Listener registrations the selector makes on `document` or `window`, by event type. */
function spyOnTargets() {
  const added: Array<[string, unknown]> = []
  const removed: Array<[string, unknown]> = []
  for (const target of GLOBAL_TARGETS()) {
    const add = target.addEventListener.bind(target)
    const remove = target.removeEventListener.bind(target)
    vi.spyOn(target, 'addEventListener').mockImplementation((type: string, fn: unknown, opts?: unknown) => {
      added.push([type, fn])
      return add(type, fn as EventListener, opts as AddEventListenerOptions)
    })
    vi.spyOn(target, 'removeEventListener').mockImplementation((type: string, fn: unknown, opts?: unknown) => {
      removed.push([type, fn])
      return remove(type, fn as EventListener, opts as EventListenerOptions)
    })
  }
  return { added, removed }
}

const OUTSIDE_EVENTS = new Set([
  'click',
  'touchstart',
  'keydown'
])
const outside = (calls: Array<[string, unknown]>) => {
  return calls.filter(([type]) => OUTSIDE_EVENTS.has(type))
}

const open = () => mountSuspended(LanguageSelector, { props: { variant: 'desktop' }, route: '/en' })

describe('language selector listeners', () => {
  afterEach(() => vi.restoreAllMocks())

  it('registers no document listener while closed', async () => {
    const calls = spyOnTargets()
    await open()
    expect(outside(calls.added)).toHaveLength(0)
  })

  it('registers the outside-click listeners when it opens', async () => {
    const calls = spyOnTargets()
    const wrapper = await open()
    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(outside(calls.added).length).toBeGreaterThan(0)
  })

  describe('closing behaves as before', () => {
    const openMenu = async () => {
      const wrapper = await mountSuspended(LanguageSelector, {
        props: { variant: 'desktop' }, route: '/en', attachTo: document.body
      })
      await wrapper.find('button').trigger('click')
      await nextTick()
      expect(wrapper.find('[role="menu"]').exists(), 'menu is open').toBe(true)
      return wrapper
    }

    it('closes on a click outside', async () => {
      const wrapper = await openMenu()
      document.body.dispatchEvent(new Event('click', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      wrapper.unmount()
    })

    it('closes on a touch outside', async () => {
      const wrapper = await openMenu()
      document.body.dispatchEvent(new Event('touchstart', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      wrapper.unmount()
    })

    it('closes on Escape pressed anywhere in the document', async () => {
      const wrapper = await openMenu()
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      wrapper.unmount()
    })

    it('stays open on a click inside the menu', async () => {
      const wrapper = await openMenu()
      wrapper.find('[role="menu"]').element.dispatchEvent(new Event('click', { bubbles: true }))
      await nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)
      wrapper.unmount()
    })
  })

  it('removes every listener it added when it closes', async () => {
    const calls = spyOnTargets()
    const wrapper = await open()
    const button = wrapper.find('button')
    await button.trigger('click')
    await nextTick()
    await button.trigger('click')
    await nextTick()
    const removedFns = new Set(outside(calls.removed).map(([, fn]) => fn))
    for (const [, fn] of outside(calls.added)) {
      expect(removedFns.has(fn), 'every added listener is removed again').toBe(true)
    }
  })
})
