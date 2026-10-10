import { describe, expect, it } from 'vitest'
import { spdxLicenseUrl } from '../../layers/projects/utils/spdx'

describe('spdxLicenseUrl', () => {
  it('maps a known SPDX identifier to its spdx.org page', () => {
    expect(spdxLicenseUrl('AGPL-3.0')).toBe('https://spdx.org/licenses/AGPL-3.0.html')
  })

  it('matches identifiers case-insensitively and links with the canonical casing', () => {
    expect(spdxLicenseUrl('agpl-3.0-or-later')).toBe('https://spdx.org/licenses/AGPL-3.0-or-later.html')
  })

  it('returns undefined for a license that is not an SPDX identifier', () => {
    expect(spdxLicenseUrl('Proprietary')).toBeUndefined()
    expect(spdxLicenseUrl('All rights reserved')).toBeUndefined()
  })

  it('returns undefined when no license is given', () => {
    expect(spdxLicenseUrl(undefined)).toBeUndefined()
    expect(spdxLicenseUrl('')).toBeUndefined()
  })
})
