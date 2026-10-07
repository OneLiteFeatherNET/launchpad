import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, relativeToRepo } from '../helpers/sources'

/**
 * Drafts use `TODO` as a placeholder for rules or numbers the authors still
 * owe. Content is published as written, so one slipping through would show
 * the word on a live page.
 */

const TODO = /\bTODO\b/

/** Every line of `text` holding the placeholder, as `line N: <text>`. */
export function todoLines(text: string): string[] {
  return text
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => TODO.test(line))
    .map(({ line, number }) => `line ${number}: ${line.trim()}`)
}

describe('content placeholders', () => {
  it('finds a TODO bullet and a bare TODO answer', () => {
    expect(todoLines('- fine\n- TODO: Fähigkeiten\n\n**Frage?**\nTODO\n')).toEqual([
      'line 2: - TODO: Fähigkeiten', 'line 5: TODO',
    ])
  })

  it('ignores text without the word TODO', () => {
    expect(todoLines('Alles fertig.\nTodoliste und todo bleiben erlaubt, ebenso AUTODOC.')).toEqual([])
  })

  it('has no TODO placeholder in any content file', () => {
    const failures = collectSourceFiles(['content'], ['.md',
'.yml',
'.yaml',
'.json'])
      .flatMap((file) => todoLines(readFileSync(file, 'utf8')).map((hit) => `${relativeToRepo(file)} ${hit}`))
    expect(failures).toEqual([])
  })
})
