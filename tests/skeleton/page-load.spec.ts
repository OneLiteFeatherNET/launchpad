// @vitest-environment nuxt
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { clearError, useError, useNuxtApp } from '#imports'
import {
  cachedPageData,
  failWhenMissing,
  PAGE_DATA_OPTIONS,
  useIsLoading
} from '../../layers/content-core/composables/usePageLoad'

type Status = 'idle' | 'pending' | 'success' | 'error'

const source = (status: Status, data: string | null) => ({
  status: ref<Status>(status),
  data: ref<string | null>(data)
})

describe('failWhenMissing', () => {
  it('throws a fatal 404 on the server when nothing was found', () => {
    const { status, data } = source('success', null)
    expect(() => failWhenMissing({ status, data }, (value) => value === null, 'Gone', true))
      .toThrowError(expect.objectContaining({ statusCode: 404, fatal: true }))
  })

  it('does not throw on the server when the content exists', () => {
    const { status, data } = source('success', 'article')
    expect(() => failWhenMissing({ status, data }, (value) => value === null, 'Gone', true))
      .not.toThrow()
  })

  it('waits while the client request is still loading', async () => {
    clearError()
    const { status, data } = source('pending', null)
    failWhenMissing({ status, data }, (value) => value === null, 'Gone', false)
    await flushPromises()
    expect(useError().value).toBeUndefined()
  })

  it('shows the 404 page once the client request settled empty', async () => {
    clearError()
    const { status, data } = source('pending', null)
    failWhenMissing({ status, data }, (value) => value === null, 'Gone', false)
    status.value = 'success'
    await flushPromises()
    expect(useError().value).toMatchObject({ statusCode: 404 })
    clearError()
  })

  it('keeps the page when the client request found the content', async () => {
    clearError()
    const { status, data } = source('pending', null)
    failWhenMissing({ status, data }, (value) => value === null, 'Gone', false)
    data.value = 'article'
    status.value = 'success'
    await flushPromises()
    expect(useError().value).toBeUndefined()
  })
})

describe('useIsLoading', () => {
  it.each([
    ['idle', true],
    ['pending', true],
    ['success', false],
    ['error', false]
  ] as const)('is %s -> %s', (status, expected) => {
    expect(useIsLoading(ref<Status>(status)).value).toBe(expected)
  })
})

describe('page data options', () => {
  it('fetches lazily, so a client navigation does not wait', () => {
    expect(PAGE_DATA_OPTIONS.lazy).toBe(true)
  })

  it('serves a returning visit from the cache, but never a refresh', () => {
    const nuxtApp = useNuxtApp()
    nuxtApp.payload.data['page-load-spec'] = { cached: true }
    expect(cachedPageData('page-load-spec', nuxtApp, { cause: 'initial' })).toEqual({ cached: true })
    expect(cachedPageData('page-load-spec', nuxtApp, { cause: 'watch' })).toBeUndefined()
    delete nuxtApp.payload.data['page-load-spec']
  })
})
