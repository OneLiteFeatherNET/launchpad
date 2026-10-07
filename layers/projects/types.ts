// The CMS-derived document shape lives in content-core, the only layer
// permitted to name @nuxt/content directly (module-boundaries.spec.ts).
// Everything below derives from it by indexed access, as community-poi does.
import type { ProjectDocument, ProjectSummary } from '#layers/content-core/types'

export type { ProjectDocument, ProjectSummary }

export const PROJECT_STATUSES = [
  'active',
  'maintenance',
  'archived'
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export type ProjectLinks = NonNullable<ProjectDocument['links']>
export type ProjectDownload = NonNullable<ProjectLinks['downloads']>[number]
