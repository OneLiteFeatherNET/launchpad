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

/**
 * Walks any @nuxt/content AST shape we currently emit and returns the
 * concatenated plain text, soft-trimmed to `maxLength` characters.
 * Handles both the legacy excerpt AST (with `type` + `children`) and the
 * minimark body format (arrays of `[tag, attrs, ...children]` tuples).
 */
export function extractPlainText(node: any, maxLength = 180): string {
  if (!node) return ''

  const parts: string[] = []

  const walk = (n: any) => {
    if (!n) return
    // Text node
    if (typeof n.value === 'string') {
      parts.push(n.value)
      return
    }
    // minimark wrapper: { type: 'minimark', value: [[tag, attrs, ...children], ...] }
    if (n.type === 'minimark' && n.value) {
      walkMinimark(n.value, parts)
      return
    }
    // Element with children (paragraphs, links, strong, etc.)
    if (Array.isArray(n.children)) {
      for (const child of n.children) walk(child)
      // Add space between block-ish nodes
      if (n.type === 'paragraph') parts.push(' ')
      return
    }
    // Arrays of nodes
    if (Array.isArray(n)) {
      for (const child of n) walk(child)
      return
    }
  }

  walk(node)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''

  if (text.length <= maxLength) return text
  // Soft trim at word boundary
  const clipped = text.slice(0, maxLength)
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trim() + '…'
}

