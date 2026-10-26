import type { EventDocument, EventPhase } from '../types'
import { serverAddressCopiedEvent } from '../utils/eventConversions'

/** Conversion tracking for event pages; the page binds these to the components' emits. */
export function useEventConversions() {
  const { trackEvent } = useAnalytics()

  const trackServerAddressCopied = (
    detail: { event: EventDocument, phase: EventPhase },
    locale: string
  ) => {
    const { name, properties } = serverAddressCopiedEvent(detail.event, locale, detail.phase)
    trackEvent(name, properties)
  }

  return { trackServerAddressCopied }
}
