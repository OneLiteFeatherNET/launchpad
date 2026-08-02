#!/usr/bin/env node
/**
 * Quality ratchet for lint and type errors.
 *
 * The repository carries a large backlog of ESLint and TypeScript errors that
 * accumulated while no CI job measured them. Failing the build on the absolute
 * count would block every pull request until the whole backlog is cleared, so
 * this gate compares against a recorded baseline instead: it fails when a count
 * *rises* and reports when one falls.
 *
 * Lower the numbers in `quality-baseline.json` whenever you fix something — run
 * `pnpm quality:update` and commit the result. The counts may never go up.
 *
 *   node scripts/quality-gate.mjs           # check against the baseline
 *   node scripts/quality-gate.mjs --update  # rewrite the baseline (only lowers)
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE = resolve(ROOT, 'quality-baseline.json')
const UPDATE = process.argv.includes('--update')

const ESLINT_ARGS = [
  'exec',
  'eslint',
  '.',
  '-f',
  'json',
]

const TSC_ARGS = [
  'exec',
  'vue-tsc',
  '--noEmit',
  '-p',
  'tsconfig.json',
]

const METRICS = [
  ['eslintErrors', 'ESLint errors'],
  ['eslintWarnings', 'ESLint warnings'],
  ['typeErrors', 'TypeScript errors'],
]

/** Run a command, returning stdout even when it exits non-zero. */
function run(args) {
  try {
    return execFileSync('pnpm', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch (error) {
    if (error.stdout !== undefined) return error.stdout
    throw error
  }
}

function countEslint() {
  const raw = run(ESLINT_ARGS)
  const results = JSON.parse(raw.slice(raw.indexOf('[')))
  return {
    eslintErrors: results.reduce((n, r) => n + r.errorCount, 0),
    eslintWarnings: results.reduce((n, r) => n + r.warningCount, 0),
  }
}

function countTypes() {
  const out = run(TSC_ARGS)
  return { typeErrors: (out.match(/error TS\d+/g) || []).length }
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'))
const actual = { ...countEslint(), ...countTypes() }

let regressed = false
let improved = false

console.log('\nQuality gate — counts must never rise above the baseline.\n')

for (const [key, label] of METRICS) {
  const now = actual[key]
  const was = baseline[key]
  const delta = now - was
  if (delta > 0) {
    console.log(`  x ${label.padEnd(20)} ${now}  (baseline ${was}, +${delta})`)
    regressed = true
  } else if (delta < 0) {
    console.log(`  v ${label.padEnd(20)} ${now}  (baseline ${was}, ${delta})`)
    improved = true
  } else {
    console.log(`  = ${label.padEnd(20)} ${now}`)
  }
}

if (UPDATE) {
  const next = { ...baseline }
  for (const [key] of METRICS) next[key] = Math.min(baseline[key], actual[key])
  writeFileSync(BASELINE, `${JSON.stringify(next, null, 2)}\n`)
  console.log('\nBaseline updated.\n')
  process.exit(0)
}

if (regressed) {
  console.log('\nThis change introduces new lint or type errors. Fix them, or - if the rise'
    + '\nis genuinely unavoidable - raise the baseline in the same commit and say why.\n')
  process.exit(1)
}

if (improved) {
  console.log('\nCounts dropped. Lock the improvement in by running:'
    + '\n  pnpm quality:update'
    + '\nand committing quality-baseline.json, so the gain cannot be lost again.\n')
}

console.log('No regression.\n')
