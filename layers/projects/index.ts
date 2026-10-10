// Public API of the projects layer. Only values that are safe in the client
// bundle: the composables reach content through content-core's repository,
// never @nuxt/content directly (see AGENTS.md on index.ts value exports).
export { useProjectsOverview, useProjectsBySlugs, useProjectDetail } from './composables/useProjects'
export type { ProjectDetail } from './composables/useProjects'
export { sortProjects } from './utils/projectLists'
export type * from './types'
