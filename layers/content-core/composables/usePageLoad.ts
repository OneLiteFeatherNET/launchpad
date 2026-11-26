import type { NuxtApp } from '#app'
import { createError, showError, useNuxtApp } from '#imports'
import { computed, watch, type Ref } from 'vue'

type LoadStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * Reads a page's data back from the payload on the first fetch of a key.
 *
 * Nuxt purges a key's data when the page unmounts, so going back to a page
 * would fetch again and show its skeleton again. A custom `getCachedData`
 * keeps the entry for the session. Only the initial fetch of a key reads the
 * cache; a refresh (a watched source changed) always asks again.
 */
export function cachedPageData<T>(
  key: string,
  nuxtApp: NuxtApp,
  context: { cause: string }
): T | undefined {
  if (context.cause !== 'initial') return undefined
  return (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as T | undefined
}

/**
 * Options for the `useAsyncData` behind a content page.
 *
 * `lazy` lets a client-side navigation render the page at once instead of
 * waiting for its data; the page shows a skeleton until the data arrives. The
 * server still waits for lazy data before it renders, so the HTML of a direct
 * load is complete and carries no skeleton.
 */
export const PAGE_DATA_OPTIONS = {
  lazy: true,
  getCachedData: cachedPageData
} as const

/** Whether a request has not settled yet — the moment to show a skeleton. */
export function useIsLoading(status: Ref<LoadStatus>) {
  return computed(() => status.value === 'idle' || status.value === 'pending')
}

interface NotFoundSource<T> {
  data: Ref<T>
  status: Ref<LoadStatus>
}

/**
 * Turns a missing content item into a 404 page.
 *
 * On the server the data is already resolved, so this throws a fatal error
 * and the response carries the status. On the client the data may still be on
 * its way: once the request has settled with nothing to show, the error page
 * is raised with `showError`.
 */
export function failWhenMissing<T>(
  source: NotFoundSource<T>,
  isMissing: (data: T) => boolean,
  statusMessage: string,
  server: boolean = import.meta.server
) {
  const notFound = () => createError({ statusCode: 404, statusMessage, fatal: true })

  if (server) {
    if (isMissing(source.data.value)) throw notFound()
    return
  }

  // A watcher callback runs without the Nuxt context `showError` needs.
  const nuxtApp = useNuxtApp()
  const check = () => {
    if (source.status.value === 'idle' || source.status.value === 'pending') return
    if (isMissing(source.data.value)) nuxtApp.runWithContext(() => showError(notFound()))
  }
  check()
  watch(source.status, check)
}
