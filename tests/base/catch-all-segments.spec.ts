import { describe, expect, it } from 'vitest'
import { catchAllSegments } from '../../layers/base/utils/catchAllSegments'

describe('catchAllSegments', () => {
  it('drops the empty segment a trailing slash adds', () => {
    expect(catchAllSegments(['dev-blog-1', ''])).toEqual(['dev-blog-1'])
  })

  it('keeps a plain segment list unchanged', () => {
    expect(catchAllSegments(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('wraps a string param', () => {
    expect(catchAllSegments('dev-blog-1')).toEqual(['dev-blog-1'])
  })

  it('yields no segments for a list holding only the empty segment', () => {
    expect(catchAllSegments([''])).toEqual([])
  })

  it('yields no segments for an empty string', () => {
    expect(catchAllSegments('')).toEqual([])
  })

  it('yields no segments when the param is absent', () => {
    expect(catchAllSegments(undefined)).toEqual([])
  })
})
