// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NavigationIconButton from '../../components/base/buttons/NavigationIconButton.vue'

/**
 * The static check in `frozen-props.spec.ts` says the pattern is gone. This
 * one says the behaviour it cost us is back: change a prop after the first
 * render and watch the output follow.
 *
 * It matters because a frozen prop fails *silently*. There is no error, no
 * warning, and the call site looks right — the component simply keeps
 * rendering what it was handed first. A grep can prove the shape of the code;
 * only a re-render can prove the shape was the thing that mattered.
 *
 * `NavigationIconButton` is the subject because its `variant` drives a class
 * binding directly, so one assertion covers the whole path from prop to DOM.
 * Its sibling components freeze the same prop behind a `v-if`, which fails the
 * same way for the same reason.
 */

const FILLED = 'bg-[var(--color-brand-secondary)]'
const OUTLINED = 'border-[var(--color-border)]'

describe('prop changes reach the DOM', () => {
  it('re-renders when variant changes after mount', async () => {
    const wrapper = mount(NavigationIconButton, {
      props: { icon: ['fas', 'chevron-left'], variant: 'filled' },
      global: { stubs: { IconFa: true } }
    })

    expect(wrapper.html()).toContain(FILLED)
    expect(wrapper.html()).not.toContain(OUTLINED)

    await wrapper.setProps({ variant: 'outlined' })

    // Frozen, this second pair fails while the first still passes — the
    // component renders the variant it was born with.
    expect(wrapper.html()).toContain(OUTLINED)
    expect(wrapper.html()).not.toContain(FILLED)
  })

  it('falls back to the declared default when the prop is omitted', async () => {
    const wrapper = mount(NavigationIconButton, {
      props: { icon: ['fas', 'chevron-left'] },
      global: { stubs: { IconFa: true } }
    })

    // 'standard' carries no variant class of its own.
    expect(wrapper.html()).not.toContain(FILLED)
    expect(wrapper.html()).not.toContain(OUTLINED)

    await wrapper.setProps({ variant: 'tonal' })
    expect(wrapper.html()).toContain('bg-[var(--color-surface)]/60')
  })
})
