/**
 * Utilities for working with @nuxt/content document structures.
 * Focus: extracting plain text from the `excerpt` AST for meta descriptions.
 */

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

