import { queryCollection } from '@nuxt/content/server'
// Past content-core's index on purpose: see ALLOWED_DEEP_IMPORTS in
// tests/architecture/module-boundaries.spec.ts.
import { createNuxtContentAdapter } from '~/layers/content-core/utils/content/nuxtContentAdapter'
import { ContentQueryError, handleContentQuery } from '~/layers/content-core/utils/content/contentApiHandler'

/**
 * Content queries for the browser. On a client-side navigation the fetch
 * adapter calls this route instead of loading @nuxt/content's SQLite
 * WebAssembly and SQL dumps. Only `ContentRepository` method names are
 * accepted (404 otherwise) and their arguments are validated (400).
 *
 * The answer is `{ result }`: a bare `null` body would arrive as an empty one.
 */
export default defineEventHandler(async (event) => {
  const query = (collection: string) => queryCollection(event, collection as never)
  const repository = createNuxtContentAdapter(query as never)
  const { method } = getRouterParams(event)
  const { args } = getQuery(event)

  try {
    const result = await handleContentQuery(
      repository,
      method ?? '',
      typeof args === 'string' ? args : undefined
    )
    return { result: result ?? null }
  } catch (error) {
    if (error instanceof ContentQueryError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw error
  }
})
