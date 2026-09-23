/**
 * The Markdown AST shapes @nuxt/content hands this site, named so code that
 * walks them is checked against a shape instead of `any`.
 *
 * Two formats arrive, depending on where the tree comes from:
 *
 * - **Minimark** — the compact format of a document's `body`:
 *   `{ type: 'minimark', value: [[tag, attrs, ...children], ...] }`, where a
 *   child is either a string or another `[tag, attrs, ...]` tuple.
 * - **Node objects** — the older MDC format still used by `excerpt`:
 *   `{ type: 'text', value }` for text and `{ type, children }` for elements.
 *
 * The data reaches us as untyped frontmatter columns, so these types describe
 * what the walkers accept after narrowing — see the guards in
 * `utils/content.ts`. Anything that matches neither format is skipped there.
 */

/** A minimark element: `[tag, attrs, ...children]`. */
export type MinimarkElement = [
  tag: string,
  attrs: Record<string, unknown>,
  ...children: MinimarkNode[],
]

/** A minimark child: text, or a nested element. */
export type MinimarkNode = string | MinimarkElement

/** The root of a minimark tree, as stored in a document's `body`. */
export type MinimarkRoot = { type: 'minimark', value: MinimarkNode[] }

/** A text leaf in the node-object format. */
export type ContentTextNode = { type?: string, value: string }

/** An element in the node-object format. */
export type ContentElementNode = { type?: string, children: unknown[] }

/** Every AST shape the content walkers understand. */
export type ContentAstNode = MinimarkRoot | ContentTextNode | ContentElementNode | ContentAstNode[]
