import type { Locale } from '#layers/content-core'
import type { ServerConnectDocument } from '../types'

/**
 * The server connect document (Java and Bedrock addresses) for the active
 * locale. Shares its cache key with `useHomeContent`, so both read one payload.
 */
export async function useServerConnect() {
  const { locale } = useI18n()
  const repo = useContentRepository()
  const activeLocale = computed<Locale>(() => (locale?.value || 'de') as Locale)

  const { data: connect } = await useAsyncData<ServerConnectDocument | null>(
    () => `server-connect-${activeLocale.value}`,
    () => repo.getServerConnect(activeLocale.value),
    { watch: [activeLocale] }
  )

  return { connect }
}
