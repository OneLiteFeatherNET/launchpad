/**
 * Utilities for working with @nuxt/content document structures.
 * Focus: extracting plain text from the `excerpt` AST for meta descriptions
 * and walking the `body` AST (minimark format) for things like word counts.
 */

import type {
  ContentElementNode,
  ContentTextNode,
  MinimarkElement,
  MinimarkRoot
} from '../types-ast'

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

/** A `[tag, attrs, ...children]` tuple, as opposed to a plain child list. */
function isMinimarkElement(input: unknown): input is MinimarkElement {
  return Array.isArray(input)
    && input.length >= 2
    && typeof input[0] === 'string'
    && isRecord(input[1])
}

function isMinimarkRoot(input: unknown): input is MinimarkRoot {
  return isRecord(input) && input.type === 'minimark' && Array.isArray(input.value)
}

function isTextNode(input: unknown): input is ContentTextNode {
  return isRecord(input) && typeof input.value === 'string'
}

function isElementNode(input: unknown): input is ContentElementNode {
  return isRecord(input) && Array.isArray(input.children)
}

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
  if (isMinimarkElement(input)) {
    const [, , ...children] = input
    for (const child of children) walkMinimark(child, sink)
    return
  }
  if (Array.isArray(input)) {
    for (const child of input) walkMinimark(child, sink)
  }
}

/**
 * Walks the node-object format (`excerpt`) and hands a minimark root it meets
 * on to `walkMinimark`. A shape that is neither is skipped: the input is an
 * untyped frontmatter column, and a stray value must not end up in the text.
 */
const walkNodes = (input: unknown, sink: string[]): void => {
  if (isTextNode(input)) {
    sink.push(input.value)
    return
  }
  if (isMinimarkRoot(input)) {
    walkMinimark(input.value, sink)
    return
  }
  if (isElementNode(input)) {
    for (const child of input.children) walkNodes(child, sink)
    // Add space between block-ish nodes
    if (input.type === 'paragraph') sink.push(' ')
    return
  }
  if (Array.isArray(input)) {
    for (const child of input) walkNodes(child, sink)
  }
}

/**
 * Walks any @nuxt/content AST shape we currently emit (see `ContentAstNode`)
 * and returns the concatenated plain text, soft-trimmed to `maxLength`
 * characters. Takes `unknown` because every caller reads the tree from an
 * untyped column; the guards above narrow it to the named shapes.
 */
export function extractPlainText(node: unknown, maxLength = 180): string {
  if (!node) return ''

  const parts: string[] = []
  walkNodes(node, parts)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''

  if (text.length <= maxLength) return text
  // Soft trim at word boundary
  const clipped = text.slice(0, maxLength)
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trim() + '…'
}
