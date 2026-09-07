// Layer: content-core — the provider-agnostic content access layer, the Prose
// overrides @nuxt/content renders markdown into, and page-level SEO plumbing.
//
// The only layer permitted to name @nuxt/content. Everything above it talks to
// the ContentRepository interface instead, which is what makes swapping the CMS
// an adapter change rather than an application change.
// Enforced by tests/architecture/module-boundaries.spec.ts.
export default defineNuxtConfig({})
