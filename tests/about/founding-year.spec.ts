import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/** Confirmed by the owner: OneLiteFeather was founded in 2019. */
const FOUNDING_YEAR = '2019'

const read = (file: string) => readFileSync(`${repoRoot}/${file}`, 'utf8')

const sources: Array<{ file: string, year: (text: string) => string | undefined }> = [
  { file: 'nuxt.config.ts', year: text => /foundingDate:\s*'(\d{4})/.exec(text)?.[1] },
  { file: 'content/about/de/home.json', year: text => /(\d{4}) als OneLiteFeather gegründet/.exec(text)?.[1] },
  { file: 'content/about/en/home.json', year: text => /Founded in (\d{4})/.exec(text)?.[1] },
  { file: 'content/faq/de/what-is.md', year: text => /(\d{4}) gegründetes/.exec(text)?.[1] },
  { file: 'content/faq/en/what-is.md', year: text => /founded in (\d{4})/.exec(text)?.[1] },
  { file: 'public/llms.txt', year: text => /founded in (\d{4})/.exec(text)?.[1] }
]

describe('founding year', () => {
  it.each(sources)('states $file as the founding year', ({ file, year }) => {
    expect(year(read(file)), `founding year in ${file}`).toBe(FOUNDING_YEAR)
  })

  it('leaves no founding statement from 2021 anywhere in the sources', () => {
    const stale = /2021[^\n]{0,20}(gegründet|[Ff]ounded)|(gegründet|[Ff]ounded)[^\n]{0,20}2021/
    for (const { file } of sources) {
      expect(read(file), file).not.toMatch(stale)
    }
  })
})
