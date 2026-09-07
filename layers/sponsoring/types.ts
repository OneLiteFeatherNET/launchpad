// The CMS-derived document shape lives in content-core, the only layer
// permitted to name the content module directly (module-boundaries.spec.ts).
// This re-exports it under the same name and derives the plain entry shape
// this layer's composables actually work with.
import type { SponsorsDocument } from '#layers/content-core'

export type { SponsorsDocument }
export type SponsorEntry = NonNullable<SponsorsDocument['sponsors']>[number]
