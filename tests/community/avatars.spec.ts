import { describe, expect, it } from 'vitest'
import { smallAvatarUrl } from '../../shared/utils/liteSupporters'
import { supporterAvatarUrl } from '../../layers/community/utils/avatars'

const S3_ORIGINAL = 'https://opencollective-production.s3.us-west-1.amazonaws.com/account-avatar/1/a.png'
const SIZED = 'https://images.opencollective.com/marc44/avatar/128.png'
const PROFILE = 'https://opencollective.com/marc44'

describe('supporterAvatarUrl', () => {
  it('maps an Open Collective S3 original to the sized render of the profile', () => {
    expect(supporterAvatarUrl(S3_ORIGINAL, PROFILE)).toBe(SIZED)
  })

  it('maps an images.opencollective.com avatar to the same sized render', () => {
    expect(supporterAvatarUrl('https://images.opencollective.com/marc44/avatar/96.png', PROFILE)).toBe(SIZED)
  })

  it('returns null for an Open Collective avatar without a profile, so the original is never loaded', () => {
    expect(supporterAvatarUrl(S3_ORIGINAL, undefined)).toBeNull()
  })

  it('returns null when the profile names no collective slug', () => {
    expect(supporterAvatarUrl(S3_ORIGINAL, 'https://opencollective.com/')).toBeNull()
  })

  it('keeps an avatar from another host unchanged', () => {
    const other = 'https://mc-heads.net/avatar/marc/128'
    expect(supporterAvatarUrl(other, PROFILE)).toBe(other)
  })
})

describe('smallAvatarUrl size', () => {
  it('renders at the requested size', () => {
    expect(smallAvatarUrl(PROFILE, 128)).toBe(SIZED)
  })

  it('renders at 96px unless asked otherwise', () => {
    expect(smallAvatarUrl(PROFILE)).toBe('https://images.opencollective.com/marc44/avatar/96.png')
  })
})
