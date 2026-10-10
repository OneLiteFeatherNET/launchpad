import type { Locale } from '#layers/content-core'
import { hasLiveListedEventAt } from '#shared/utils/eventPhase'

/**
 * Whether "Events" earns a place on the navigation's top level: at least one
 * listed event that is announced or running. Lives at the root because it
 * joins the content repository with the navigation, which no layer may do.
 *
 * Decided inside the data handler so the moment is fixed on the server and
 * travels in the payload; the edge cache may serve it for a while longer.
 */
export function useEventsInNav() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data } = useAsyncData<boolean>(
    () => `events-in-nav-${activeLocale.value}`,
    async () => hasLiveListedEventAt(await repo.listEventSchedules(activeLocale.value), new Date()),
    { watch: [activeLocale], default: () => false }
  )

  return { eventsTopLevel: data }
}
