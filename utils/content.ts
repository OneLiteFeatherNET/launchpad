/**
 * Utilities for working with @nuxt/content document structures.
 * Focus: extracting plain text from the `excerpt` AST for meta descriptions
 * and walking the `body` AST (minimark format) for things like word counts.
 */

/**
 * Walks the minimark AST that @nuxt/content stores in `body.value`. Nodes
 * are tuples of the form `[tag, attrs, ...children]` where children can be
 * strings or further nodes; arrays starting with a string + object are tag
 * nodes, everything else is treated as a child list.
 */
const walkMinimark = (input: unknown, sink: string[]): void => {
  if (typeof input === 'string') {
    sink.push(input)
    return
  }
  if (!Array.isArray(input)) return
  if (input.length >= 2 && typeof input[0] === 'string' && typeof input[1] === 'object' && input[1] !== null) {
    for (let i = 2; i < input.length; i++) walkMinimark(input[i], sink)
    return
  }
  for (const child of input) walkMinimark(child, sink)
}

export function extractPlainTextFromExcerpt(excerpt: any, maxLength = 180): string {
  if (!excerpt) return ''

  // Nuxt Content often provides an object with `type` and `children`
  const parts: string[] = []

  const walk = (node: any) => {
    if (!node) return
    // Text node
    if (typeof node.value === 'string') {
      parts.push(node.value)
      return
    }
    // minimark wrapper: { type: 'minimark', value: [[tag, attrs, ...children], ...] }
    if (node.type === 'minimark' && node.value) {
      walkMinimark(node.value, parts)
      return
    }
    // Element with children (paragraphs, links, strong, etc.)
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child)
      // Add space between block-ish nodes
      if (node.type === 'paragraph') parts.push(' ')
      return
    }
    // Arrays of nodes
    if (Array.isArray(node)) {
      for (const child of node) walk(child)
      return
    }
  }

  walk(excerpt)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''

  if (text.length <= maxLength) return text
  // Soft trim at word boundary
  const clipped = text.slice(0, maxLength)
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trim() + '…'
}

