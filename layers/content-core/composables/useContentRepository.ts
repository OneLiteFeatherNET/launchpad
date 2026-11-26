import { queryCollection } from '#imports'
import type { ContentRepository } from '../utils/content/repository'
import { createNuxtContentAdapter } from '../utils/content/nuxtContentAdapter'
import { createFetchContentAdapter } from '../utils/content/fetchContentAdapter'

let instance: ContentRepository | null = null

/**
 * Returns the active {@link ContentRepository}. This is the single place that
 * decides which content backend the app talks to — swapping @nuxt/content for
 * a headless CMS later means changing only the adapters constructed here (or
 * branching on `useRuntimeConfig().public.content.provider`); no composable,
 * page or component needs to change.
 *
 * On the server the adapter queries the database directly. In the browser it
 * asks `/api/content/<method>` instead, so a client-side navigation never
 * downloads @nuxt/content's SQLite WebAssembly or SQL dumps. Both are
 * stateless, so a module-level singleton is safe for SSR and client.
 */
export function useContentRepository(): ContentRepository {
  if (!instance) {
    instance = import.meta.server
      ? createNuxtContentAdapter(queryCollection)
      : createFetchContentAdapter()
  }
  return instance
}
