import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo, repoRoot } from '../helpers/sources'

/** Every invite goes through https://1lf.link/discord so it can be repointed in one place. */
const DIRECT_INVITE = /discord\.gg\/\w|discord(?:app)?\.com\/invite\/\w/i

const contentSections = readdirSync(join(repoRoot, 'content')).filter((entry) => entry !== 'blog').map((entry) => `content/${entry}`)
const DIRS = ['layers', 'pages', 'layouts', 'i18n', 'public', 'server', 'shared', ...contentSections]
const EXTENSIONS = ['.vue', '.ts', '.json', '.txt', '.md', '.yml', '.yaml']

describe('discord invite links', () => {
  it('recognises a direct invite', () => {
    expect(DIRECT_INVITE.test('https://discord.gg/abc')).toBe(true)
    expect(DIRECT_INVITE.test('https://discord.com/invite/abc')).toBe(true)
    expect(DIRECT_INVITE.test('https://1lf.link/discord')).toBe(false)
    expect(DIRECT_INVITE.test('https://discord.com/api/v10/invites/abc')).toBe(false)
  })

  it('appear nowhere outside the blog articles', () => {
    const offenders = collectSourceFiles(DIRS, EXTENSIONS)
      .filter((file) => DIRECT_INVITE.test(readFileSync(file, 'utf8')))
      .map(relativeToRepo)
    expect(offenders, 'use runtimeConfig.public.discordUrl (https://1lf.link/discord)').toEqual([])
  })
})
