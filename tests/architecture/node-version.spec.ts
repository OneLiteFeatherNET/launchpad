import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../helpers/sources'

/**
 * `.nvmrc` is what `package.json`'s `engines.node` range is satisfied by, what
 * a contributor's version manager reads, and what CI installs — provided CI
 * actually reads it.
 *
 * Two of the five `setup-node` steps pinned `node-version: 24` inline instead.
 * They agree with `.nvmrc` today, which is exactly the problem: nothing makes
 * them keep agreeing, and the disagreement would surface as a CI-only failure
 * on a build that works locally.
 *
 * The second check ties the other end down. `engines.node` was `>=22.0.0` until
 * recently, below the `^22.12.0 || ^24.11.0 || >=26.0.0` that @nuxt/nitro-server
 * and @nuxt/vite-builder require; a `.nvmrc` naming a version outside the range
 * would be the same class of quiet mismatch.
 */

const WORKFLOW_DIR = '.github/workflows'
const SETUP_NODE = /uses:\s*actions\/setup-node@/
const INLINE_VERSION = /^\s*node-version:\s*(\S+)/
const VERSION_FILE = /^\s*node-version-file:\s*(\S+)/

function read(file: string): string {
  return readFileSync(`${repoRoot}/${file}`, 'utf8')
}

function workflows(): string[] {
  return readdirSync(`${repoRoot}/${WORKFLOW_DIR}`)
    .filter((entry) => entry.endsWith('.yml') || entry.endsWith('.yaml'))
    .map((entry) => `${WORKFLOW_DIR}/${entry}`)
}

/** Every setup-node step, with how it decides on a version. */
function setupNodeSteps(): Array<{ file: string, line: number, pin: string }> {
  const steps: Array<{ file: string, line: number, pin: string }> = []
  for (const file of workflows()) {
    const lines = read(file).split('\n')
    lines.forEach((line, index) => {
      if (!SETUP_NODE.test(line)) return
      // The `with:` block follows the `uses:` line; scan the next few entries.
      const window = lines.slice(index, index + 8)
      const fromFile = window.map((l) => VERSION_FILE.exec(l)?.[1]).find(Boolean)
      const inline = window.map((l) => INLINE_VERSION.exec(l)?.[1]).find(Boolean)
      steps.push({ file, line: index + 1, pin: fromFile ? `file:${fromFile}` : `inline:${inline ?? 'none'}` })
    })
  }
  return steps
}

/** Major versions `engines.node` admits, plus any open-ended lower bound. */
function allowedMajors(): { exact: number[], atLeast: number | null } {
  const engines = JSON.parse(read('package.json')).engines?.node as string
  const exact = [...engines.matchAll(/\^(\d+)\./g)].map(([, major]) => Number(major))
  const atLeast = /(?:>=)\s*(\d+)\./.exec(engines)?.[1]
  return { exact, atLeast: atLeast ? Number(atLeast) : null }
}

describe('node version', () => {
  it('finds the workflows and the engines range', () => {
    // Without this, an empty workflow directory would pass every rule below.
    expect(workflows().length).toBeGreaterThan(1)
    expect(setupNodeSteps().length).toBeGreaterThan(3)
    expect(allowedMajors()).toEqual({ exact: [22, 24], atLeast: 26 })
  })

  it('is decided by .nvmrc in every workflow', () => {
    const inlinePins = setupNodeSteps()
      .filter((step) => !step.pin.startsWith('file:'))
      .map((step) => `${step.file}:${step.line} pins ${step.pin}`)
    expect(inlinePins).toEqual([])
  })

  it('names a major that engines.node admits', () => {
    const major = Number(read('.nvmrc').trim().replace(/^v/, '').split('.')[0])
    const { exact, atLeast } = allowedMajors()
    expect(Number.isFinite(major)).toBe(true)
    expect(exact.includes(major) || (atLeast !== null && major >= atLeast)).toBe(true)
  })
})
