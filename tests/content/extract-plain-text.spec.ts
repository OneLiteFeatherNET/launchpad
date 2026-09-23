import { describe, expect, it } from 'vitest'
import { extractPlainText } from '../../layers/content-core/utils/content'

describe('extractPlainText', () => {
  it('reads a minimark body', () => {
    const heading = [
      'h2',
      { id: 'intro' },
      'Intro',
    ]
    const strong = [
      'strong',
      {},
      'world',
    ]
    const paragraph = [
      'p',
      {},
      'Hello ',
      strong,
      '.',
    ]
    const body = { type: 'minimark', value: [heading, paragraph] }
    expect(extractPlainText(body)).toBe('Intro Hello world .')
  })

  it('reads a legacy node-object excerpt and spaces paragraphs', () => {
    const first = { type: 'paragraph', children: [{ type: 'text', value: 'First' }] }
    const second = { type: 'paragraph', children: [{ type: 'text', value: 'Second' }] }
    const excerpt = { type: 'root', children: [first, second] }
    expect(extractPlainText(excerpt)).toBe('First Second')
  })

  it('reads a minimark root nested inside a node object', () => {
    const paragraph = [
      'p',
      {},
      'Nested',
    ]
    expect(extractPlainText([{ type: 'minimark', value: [paragraph] }])).toBe('Nested')
  })

  it('skips shapes it does not know instead of guessing', () => {
    expect(extractPlainText({ type: 'image', src: '/a.webp' })).toBe('')
    expect(extractPlainText(42)).toBe('')
    expect(extractPlainText('bare string at the root')).toBe('')
    expect(extractPlainText(null)).toBe('')
    const children = [
      { type: 'hr' },
      { type: 'text', value: 'kept' },
      7,
    ]
    expect(extractPlainText({ type: 'root', children })).toBe('kept')
  })

  it('trims at a word boundary and marks the cut', () => {
    const paragraph = [
      'p',
      {},
      'one two three four five',
    ]
    const body = { type: 'minimark', value: [paragraph] }
    expect(extractPlainText(body, 12)).toBe('one two…')
    expect(extractPlainText(body, 100)).toBe('one two three four five')
  })
})
