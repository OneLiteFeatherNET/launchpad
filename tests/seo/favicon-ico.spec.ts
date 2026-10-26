import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * Browsers and crawlers request /favicon.ico without a <link>. Without a real
 * file in public/, Nitro answers that request with a 78-byte stub.
 */

const ICO_PATH = `${repoRoot}/public/favicon.ico`
const ICO_HEADER = Buffer.from('00000100', 'hex')

/** Pixel widths of the directory entries; a stored width of 0 means 256. */
function iconSizes(buffer: Buffer): number[] {
  const count = buffer.readUInt16LE(4)
  return Array.from({ length: count }, (_, index) => {
    const width = buffer.readUInt8(6 + index * 16)
    return width === 0 ? 256 : width
  })
}

describe('public/favicon.ico', () => {
  it('exists in public/', () => {
    expect(existsSync(ICO_PATH)).toBe(true)
  })

  it('starts with the ICO header', () => {
    expect(readFileSync(ICO_PATH).subarray(0, 4).equals(ICO_HEADER)).toBe(true)
  })

  it('contains a 16 px image', () => {
    expect(iconSizes(readFileSync(ICO_PATH))).toContain(16)
  })

  it('contains a 32 px image', () => {
    expect(iconSizes(readFileSync(ICO_PATH))).toContain(32)
  })
})
