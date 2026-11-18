// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProseBlockquote from '../../layers/content-core/components/ProseBlockquote.vue'
import ProseTable from '../../layers/content-core/components/ProseTable.vue'
import ProseTd from '../../layers/content-core/components/ProseTd.vue'
import ProseTh from '../../layers/content-core/components/ProseTh.vue'
import ProseTr from '../../layers/content-core/components/ProseTr.vue'

describe('prose table', () => {
  it('wraps the table in a horizontally scrollable, bordered container', () => {
    const wrapper = mount(ProseTable, { slots: { default: '<tbody><tr><td>a</td></tr></tbody>' } })
    const root = wrapper.element as HTMLElement

    expect(root.tagName).toBe('DIV')
    expect(root.classList.contains('overflow-x-auto')).toBe(true)
    expect(root.classList.contains('border-outline-variant')).toBe(true)
    expect(root.querySelector('table')).not.toBeNull()
  })

  it('styles the header cell with a surface role and the title-small type role', () => {
    const th = mount(ProseTh, { slots: { default: 'x' } }).find('th')

    expect(th.classes()).toEqual(expect.arrayContaining(['bg-surface-container-high', 'text-title-small']))
  })

  it('separates rows with an outline-variant divider', () => {
    const tr = mount(ProseTr, { slots: { default: '' } }).find('tr')

    expect(tr.classes()).toContain('border-outline-variant')
  })

  it('pads body cells and aligns them top-left', () => {
    const td = mount(ProseTd, { slots: { default: 'x' } }).find('td')

    expect(td.classes()).toEqual(expect.arrayContaining(['px-4',
'py-3',
'text-left',
'align-top']))
  })

  it('keeps the first column on one line so ids like CVE numbers do not wrap', () => {
    const td = mount(ProseTd, { slots: { default: 'x' } }).find('td')

    expect(td.classes()).toContain('first:whitespace-nowrap')
  })
})

describe('prose blockquote', () => {
  it('sets a callout apart with a primary accent bar on a surface container', () => {
    const quote = mount(ProseBlockquote, { slots: { default: '<p>x</p>' } }).find('blockquote')

    expect(quote.classes()).toEqual(expect.arrayContaining(['border-l-4',
'border-primary',
'bg-surface-container']))
  })
})
