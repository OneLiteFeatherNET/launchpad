// The CMS-derived article and author shapes live in content-core, the only
// layer permitted to name @nuxt/content directly (module-boundaries.spec.ts).
// This re-exports them under the same names and adds the one plain shape
// that is specific to this layer.
import type { BlogArticle, BlogAuthorProfile, BlogAlternateHeader } from '#layers/content-core'

export type { BlogArticle, BlogAuthorProfile, BlogAlternateHeader }

/** An alternate-language link surfaced in an article's front matter. */
export interface BlogAlternateLanguageLink {
  locale: string
  url: string
}
