import { createError } from '#imports'
import type { LocaleObject } from 'vue-i18n-routing'
import type { Locale } from '#layers/content-core'
import { isAccessOpenAt, eventPhaseAt } from '#shared/utils/eventPhase'
import type { EventDocument, EventPhase } from '../types'
import {
  groupEventsAt,
  promotedEventsAt,
  type EventCardData,
  type GroupedEvents
} from '../utils/eventLists'

// Every phase below is decided inside a `useAsyncData` handler and travels to
// the browser in the payload. The browser never asks the clock again during
// hydration: if a phase boundary passes between the server render (or the
// edge-cached copy of it) and hydration, recomputing would render a different
// section than the HTML holds — a hydration mismatch. See design.md D4.

const useActiveLocale = () => {
  const { locale } = useI18n()
  return computed<Locale>(() => (locale?.value || 'de') as Locale)
}

const emptyGroups = (): GroupedEvents => ({
  now: new Date(0).toISOString(),
  current: [],
  upcoming: [],
  past: []
})

/** The overview's sections — running, announced, past — for the active locale. */
export function useEventsOverview() {
  const activeLocale = useActiveLocale()
  const repo = useContentRepository()

  const { data } = useAsyncData<GroupedEvents>(
    () => `events-overview-${activeLocale.value}`,
    async () => {
      const docs = await repo.listEvents(activeLocale.value)
      return groupEventsAt(docs, activeLocale.value, new Date())
    },
    { watch: [activeLocale], default: emptyGroups }
  )

  return { events: data }
}

/** The events the home carousel promotes right now, soonest first, at most two. */
export function useEventPromotions() {
  const activeLocale = useActiveLocale()
  const repo = useContentRepository()

  const { data } = useAsyncData<EventCardData[]>(
    () => `events-promoted-${activeLocale.value}`,
    async () => {
      const docs = await repo.listEvents(activeLocale.value)
      return promotedEventsAt(docs, activeLocale.value, new Date())
    },
    { watch: [activeLocale], default: () => [] }
  )

  return { promoted: data }
}

export interface EventDetail {
  event: EventDocument
  phase: Exclude<EventPhase, 'hidden'>
  /** Whether sign-up or application is open, if the event has a window. */
  accessOpen: boolean
  /** Java server address for `join.server`, from the server_connect content. */
  serverAddress?: string
  /** The moment the phase was decided, as an ISO string. */
  now: string
  /**
   * Slug of this event per locale; `null` without a translation — not
   * `undefined`, which the payload would drop along with the locale.
   */
  localeSlugs: Record<string, string | null>
}

const normalizeLocales = (list: unknown[]): LocaleObject[] => list
  .filter((locale): locale is LocaleObject => Boolean(locale && typeof locale === 'object' && 'code' in (locale as Record<string, unknown>)))
  .map((locale) => locale as LocaleObject)

/**
 * One event by the catch-all slug, with its phase. Unknown and still hidden
 * events answer 404 — a hidden event must not be reachable before its
 * announcement, even by a guessed URL.
 *
 * Publishes the slug of each translation to the language switcher and the
 * hreflang links. The translations are looked up inside the data handler, so
 * they are known before the server renders the head; a lookup after it would
 * leave the alternates pointing at this locale's slug. A locale without a
 * translation gets an empty slug, which resolves to that locale's events
 * overview instead of a guessed URL that would 404.
 */
export async function useEventDetail() {
  const { locales } = useI18n()
  const activeLocale = useActiveLocale()
  const route = useRoute()
  const repo = useContentRepository()
  const setI18nParams = useSetI18nParams()

  const slug = computed<string | undefined>(() => {
    const param = (route.params as Record<string, string | string[] | undefined>).slug
    if (Array.isArray(param)) return param.at(-1)
    return param || undefined
  })

  const { data: detail } = await useAsyncData<EventDetail | null>(
    () => `event-${activeLocale.value}-${slug.value}`,
    async () => {
      if (!slug.value) return null
      const event = await repo.getEventBySlug(activeLocale.value, slug.value)
      if (!event) return null
      const now = new Date()
      const phase = eventPhaseAt(event.event, now)
      if (phase === 'hidden') return null
      const connect = event.join?.server ? await repo.getServerConnect(activeLocale.value) : null
      const localeSlugs: Record<string, string | null> = { [activeLocale.value]: event.slug }
      for (const other of normalizeLocales((locales.value || []) as unknown[])) {
        if (other.code === activeLocale.value) continue
        const translated = event.translationKey
          ? await repo.getEventByTranslationKey(other.code as Locale, event.translationKey)
          : null
        localeSlugs[other.code] = translated?.slug ?? null
      }
      return {
        event,
        phase,
        accessOpen: isAccessOpenAt(event.access, now),
        serverAddress: connect?.javaAddress,
        now: now.toISOString(),
        localeSlugs,
      }
    },
    { watch: [activeLocale, slug] }
  )

  if (!detail.value) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true })
  }

  watch(detail, (current) => {
    if (!current) return
    const params: Record<string, { slug: string[] }> = {}
    for (const [code, localized] of Object.entries(current.localeSlugs)) {
      params[code] = { slug: localized ? [localized] : [] }
    }
    setI18nParams(params)
  }, { immediate: true })

  return { detail }
}
