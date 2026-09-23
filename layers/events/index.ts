// Public API of the events layer. Only values that are safe in the client
// bundle: the composables reach content through content-core's repository,
// never @nuxt/content directly (see AGENTS.md on index.ts value exports).
export { useEventsOverview, useEventPromotions, useEventDetail } from './composables/useEvents'
export type { EventDetail } from './composables/useEvents'
export { MAX_PROMOTED_EVENTS } from './utils/eventLists'
export type { EventCardData, GroupedEvents } from './utils/eventLists'
export type * from './types'
