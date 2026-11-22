import { onNuxtReady, useRuntimeConfig } from '#imports'
import type { CollectiveResult } from '../types'

type PublicCollectiveConfig = {
  openCollectiveSlug?: string
}

export const useOpenCollective = () => {
  const config = useRuntimeConfig()
  const publicConfig = (config.public || {}) as PublicCollectiveConfig
  const slug = publicConfig.openCollectiveSlug || 'onelitefeather'
  const link = `https://opencollective.com/${slug}`

  const unavailable = (): CollectiveResult => ({ available: false, slug, link })

  const { data, error, refresh, pending } = useAsyncData<CollectiveResult>(
    'opencollective-stats',
    async (): Promise<CollectiveResult> => {
      try {
        return await $fetch<CollectiveResult>('/api/opencollective', { timeout: 5000 })
      } catch (err) {
        console.warn('[useOpenCollective] failed to load stats', err)
        return unavailable()
      }
    },
    {
      server: true,
      lazy: false,
      default: unavailable
    }
  )

  // The edge may hold HTML rendered during an outage; ask once more in the browser.
  // Not before hydration is over: a refresh then would just return the payload.
  onNuxtReady(() => {
    if (!pending.value && !data.value.available) refresh()
  })

  return {
    data,
    error,
    refresh,
    pending
  }
}
