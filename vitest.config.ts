import { defineVitestConfig } from '@nuxt/test-utils/config'

// Two kinds of test live here, and they need different environments:
//
//   *.spec.ts   plain Node — pure functions, config invariants, and checks
//               that read the repository's own files (colour tokens, i18n
//               keys, content frontmatter). No DOM, so they stay fast.
//
//   Component tests that need auto-imports or a Nuxt runtime opt in per file
//   with a docblock comment:
//
//       // @vitest-environment nuxt
//
//   That is the supported mechanism in Vitest 4 — the older
//   `environmentMatchGlobs` config key was removed and is a type error now.
//   Per-file opt-in is also the cheaper default: booting Nuxt costs seconds,
//   and most checks here never need it.
export default defineVitestConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'node',
  },
})
